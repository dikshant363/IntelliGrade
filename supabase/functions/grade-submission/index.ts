import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RubricSection {
  name: string;
  description: string;
  max_marks: number;
  keywords?: string;
  concept_expectations?: string;
}

interface Rubric {
  id: string;
  title: string;
  sections: RubricSection[];
  total_marks: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { submission_id } = await req.json();

    if (!submission_id) {
      throw new Error("submission_id is required");
    }

    // Initialize Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Grading submission: ${submission_id}`);

    // Fetch submission details
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select("*, rubric_id")
      .eq("id", submission_id)
      .single();

    if (submissionError || !submission) {
      throw new Error("Submission not found");
    }

    if (!submission.rubric_id) {
      throw new Error("No rubric assigned to this submission");
    }

    // Update submission status to 'grading'
    await supabase
      .from("submissions")
      .update({ status: "grading" })
      .eq("id", submission_id);

    // Fetch rubric
    const { data: rubric, error: rubricError } = await supabase
      .from("rubrics")
      .select("*")
      .eq("id", submission.rubric_id)
      .single();

    if (rubricError || !rubric) {
      throw new Error("Rubric not found");
    }

    console.log(`Using rubric: ${rubric.title}`);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("reports")
      .download(submission.file_path);

    if (downloadError || !fileData) {
      throw new Error("Failed to download report file");
    }

    // For this demo, we'll extract basic text content
    // In production, you'd use proper PDF/DOCX parsers
    const fileContent = await fileData.text();
    const textContent = fileContent.substring(0, 50000); // Limit to avoid token limits

    console.log(`Extracted ${textContent.length} characters from report`);

    // Build grading prompt for AI
    const systemPrompt = `You are an expert academic evaluator. Your task is to grade a student's academic report based on the provided rubric.

For each section in the rubric:
1. Carefully analyze the relevant content in the report
2. Assess how well it meets the stated expectations
3. Assign marks (0 to max_marks for that section)
4. Provide constructive feedback explaining the score
5. Estimate how strongly the student's work matches the rubric expectations on a 0-100 scale and explain your reasoning.

Be fair, objective, and constructive in your evaluation.`;

    const rubricSections = rubric.sections as RubricSection[];
    const rubricText = rubricSections
      .map((s, i) => {
        const keywordText = s.keywords ? `\nKey keywords/phrases to look for: ${s.keywords}` : "";
        const conceptText = s.concept_expectations
          ? `\nConcept expectations: ${s.concept_expectations}`
          : "";
        return `Section ${i + 1}: ${s.name} (Max: ${s.max_marks} marks)\nExpectations: ${s.description}${keywordText}${conceptText}`;
      })
      .join("\n\n");

    const userPrompt = `Grade this academic report based on the following rubric:

RUBRIC:
${rubricText}

REPORT CONTENT:
${textContent}

Provide detailed section-wise grading with marks, feedback, and similarity assessment for each section.`;

    // Call Lovable AI with tool calling for structured output
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_grading",
              description: "Submit the grading results for the academic report",
              parameters: {
                type: "object",
                properties: {
                  section_grades: {
                    type: "array",
                    description: "Grades for each rubric section",
                    items: {
                      type: "object",
                      properties: {
                        section_name: { type: "string" },
                        marks_awarded: { type: "number" },
                        max_marks: { type: "number" },
                        feedback: { type: "string" },
                        similarity_score: {
                          type: "number",
                          description: "Similarity or alignment score (0-100) between the student's work and rubric expectations",
                        },
                        similarity_explanation: {
                          type: "string",
                          description: "Short explanation of why this similarity score was assigned",
                        },
                      },
                      required: ["section_name", "marks_awarded", "max_marks", "feedback"],
                    },
                  },
                  overall_feedback: {
                    type: "string",
                    description: "Overall summary feedback for the report",
                  },
                },
                required: ["section_grades", "overall_feedback"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_grading" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI grading failed: ${response.status}`);
    }

    const aiResult = await response.json();
    console.log("AI response received");

    // Parse tool call result
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("AI did not return grading results");
    }

    const gradingData = JSON.parse(toolCall.function.arguments);
    const sectionGrades = gradingData.section_grades;
    const overallFeedback = gradingData.overall_feedback;

    // Calculate totals
    const totalMarksAwarded = sectionGrades.reduce(
      (sum: number, s: any) => sum + s.marks_awarded,
      0
    );

    const processingTime = Date.now() - startTime;

    // Store grading results
    const { error: insertError } = await supabase.from("grading_results").insert({
      submission_id,
      rubric_id: rubric.id,
      section_grades: sectionGrades,
      total_marks_awarded: totalMarksAwarded,
      total_max_marks: rubric.total_marks,
      overall_feedback: overallFeedback,
      ai_model: "google/gemini-2.5-flash",
      processing_time_ms: processingTime,
    });

    if (insertError) {
      console.error("Failed to store results:", insertError);
      throw new Error("Failed to store grading results");
    }

    // Update submission status to 'graded'
    await supabase
      .from("submissions")
      .update({ status: "graded" })
      .eq("id", submission_id);

    console.log(`Grading completed in ${processingTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        total_marks_awarded: totalMarksAwarded,
        total_max_marks: rubric.total_marks,
        processing_time_ms: processingTime,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Grading error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
