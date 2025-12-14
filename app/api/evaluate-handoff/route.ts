import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { EvaluateHandoffRequest, HandoffFeedback } from "@/lib/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SENIOR_PROMPT = `你是一位資深的 ICU 主治醫師（學長），正在聽取住院醫師的交班報告。

你的任務是評估這份交班報告的品質，並給予建設性的回饋。

評估標準：
1. Situation - 是否清楚說明病人身份與目前緊急情況
2. Background - 是否涵蓋相關病史、入院原因、重要檢查結果
3. Assessment - 是否有合理的臨床判斷和鑑別診斷
4. Recommendation - 是否有具體的處置計畫

請根據以下資訊評估這份報告：

【病人實際情況】
診斷：{diagnosis}
關鍵鑑別點：{key_differentiators}

【學員進行的檢查/處置】
- 理學檢查：{exams}
- 開立檢驗：{labs}
- POCUS：{pocus}
- 醫囑：{medications}

【學員的 SBAR 報告】
S (Situation): {situation}
B (Background): {background}
A (Assessment): {assessment}
R (Recommendation): {recommendation}

請以 JSON 格式回覆，格式如下：
{
  "overall": "excellent" | "good" | "needs_improvement",
  "score": 0-100,
  "strengths": ["做得好的地方1", "做得好的地方2"],
  "missedPoints": ["遺漏的重點1", "遺漏的重點2"],
  "suggestions": ["改善建議1", "改善建議2"],
  "seniorComment": "學長的整體評語（用口語化、鼓勵但有建設性的語氣，像真正的學長說話）"
}

評分標準：
- 90-100：優秀 (excellent) - 完整、準確、有條理
- 70-89：良好 (good) - 大致完整但有小遺漏
- 0-69：需加強 (needs_improvement) - 有重要遺漏或錯誤

請用繁體中文回覆，但醫學術語可用英文。語氣要像真正的 ICU 學長，親切但專業。`;

export async function POST(request: NextRequest) {
  try {
    const body: EvaluateHandoffRequest = await request.json();
    const { sbar, scenario, actions } = body;

    // Format the data for the prompt
    const exams = actions.examinedItems.length > 0
      ? actions.examinedItems.map(e => `${e.category}: ${e.item}`).join(", ")
      : "未進行";

    const labs = actions.orderedLabs.length > 0
      ? actions.orderedLabs.map(l => l.category).join(", ")
      : "未開立";

    const pocus = actions.pocusExamined.length > 0
      ? actions.pocusExamined.map(p => p.view).join(", ")
      : "未執行";

    const medications = actions.orderedMedications.length > 0
      ? actions.orderedMedications.map(m => `${m.name} ${m.dose}${m.unit}`).join(", ")
      : "未開立";

    const prompt = SENIOR_PROMPT
      .replace("{diagnosis}", scenario.diagnosis.primary)
      .replace("{key_differentiators}", scenario.diagnosis.key_differentiators.join(", "))
      .replace("{exams}", exams)
      .replace("{labs}", labs)
      .replace("{pocus}", pocus)
      .replace("{medications}", medications)
      .replace("{situation}", sbar.situation)
      .replace("{background}", sbar.background)
      .replace("{assessment}", sbar.assessment)
      .replace("{recommendation}", sbar.recommendation);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract text from response
    const textContent = response.content.find((block) => block.type === "text");
    const responseText = textContent?.text || "";

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse feedback JSON");
    }

    const feedback: HandoffFeedback = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Evaluate handoff error:", error);

    // Return a default feedback on error
    const defaultFeedback: HandoffFeedback = {
      overall: "good",
      score: 70,
      strengths: ["完成了交班報告的撰寫"],
      missedPoints: ["無法取得詳細評估"],
      suggestions: ["請確認網路連線後再試一次"],
      seniorComment: "辛苦了！系統暫時無法完成評估，但你願意練習交班報告這點很好。繼續加油！",
    };

    return NextResponse.json({ feedback: defaultFeedback });
  }
}
