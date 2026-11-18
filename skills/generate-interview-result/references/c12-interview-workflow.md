# C12 interview document workflow

Use this reference for Drake's C12 candidate interview documents. These defaults apply unless Drake supplies another template, bank, or interview format.

## Sources and document identity

1. Fetch the shared [interview template](https://carbon12.feishu.cn/wiki/U4zYw3mVMigazqk4NPacMNHWnug) and [question bank](https://carbon12.feishu.cn/wiki/MSgtwTJDQiHnlNkdkVLcClDFn2g) through the Feishu workflow. Use their current content as the source.
2. Create a candidate-specific copy of the template for preparation. If the candidate already has a document, read and update that document. When a transcript arrives later, use that same document.
3. Set `面试形式` to exactly `周宇轩, 一面, 技术面试，60 分钟`. A user-supplied format overrides this default. The duration is interview metadata, not a reason to remove selected questions.
4. Keep the source bank link in the candidate document. Preserve individual question links or anchors when available.

## Prepare the question record

1. Select questions against the role and candidate resume. Preserve every selected bank question verbatim, with its order, subquestions, and source link. Preserve any set already selected by Drake. Do not shorten, paraphrase, or remove a selected question to fit the interview duration.
2. Use section headings without time budgets or minute ranges. Keep the full selected set even when the interview may not reach every question.
3. Where the resume gives a useful project context, add alternative wording immediately below the original question. Render the alternative wording in gray text with Feishu-native text styling. Do not put parentheses around it. Keep the original bank wording and source link visible. The gray line is an optional way to ask the same question, not an extra answer or a replacement question.
4. Under each independently answerable question, create separate blank lines in this order. Separate paragraph blocks or line breaks (`<br/>`) within one list block are both acceptable:

   ```text
   问：
   答：
   ```

   Keep the question text above these blocks. Each independently answerable subquestion also needs its own pair. The `问：` line can later record the actual wording or follow-up. The `答：` line is for the candidate's actual response. Keep both lines blank during preparation. Verify that the rendered document shows two distinct lines.
5. Add an `现场新增问题与追问` area for questions outside the prepared set. Include separate blank `问：` and `答：` lines there. Add more pairs as needed after the interview.
6. Reserve a separate `面评` section at its existing template position, before the question record. Preserve the template's evaluation fields there, including recommendation, strengths, risks, summary, and decision. Leave these fields blank and all recommendation choices unselected before the interview. Do not fill this area from the resume alone.
7. Attach the supplied original resume file at the end of the candidate document, following the entrypoint's attachment procedure and standing authorization.

If an API write does not preserve gray text, apply the native style after insertion. Verify the actual text style. Markdown parentheses or a gray label do not satisfy the styling requirement. Report a styling blocker if the available tools cannot apply or verify it.

## Update from the actual interview

1. Read the complete transcript or notes. Identify the candidate, interviewer, document, and source segments before editing. Normalize only clear transcription errors. Retain meaningful uncertainty.
2. Map each actual interviewer question to its prepared question when the match is supported. Record the actual wording under `问：` and the candidate's response under `答：`. Preserve the original bank question and its source link above the record.
3. Record follow-ups as their own Q/A pairs. Preserve their relationship to the main question. Put unplanned topics in `现场新增问题与追问`, with their actual questions and responses. Do not force them into an unrelated prepared question.
4. Summarize long answers faithfully when needed. Preserve the candidate's reasoning, examples, qualifications, errors, and any correction after a follow-up. Keep enough source detail to trace material assessment claims to transcript segments or timestamps when available.
5. Distinguish coverage states explicitly:

   | State | Record |
   |---|---|
   | Reliable complete record shows a question was not asked | `未问` |
   | Question was asked, but its response is absent from the available record | `记录中未找到回答` |
   | Audio, transcription, speaker identity, or meaning is uncertain | `记录不清` with the specific uncertainty |
   | Record is incomplete and asking cannot be established | `是否提问无法确认` |
   | Candidate explicitly says they do not know or cannot answer | Record that actual response |

   Missing evidence does not establish that the candidate failed or stayed silent.
6. Keep the record factual. Assistant speculation, question-bank reference answers, interviewer explanations, and ideal answers must not appear as the candidate's response. Attribute interviewer hints separately when they affect the assessment.
7. Fill the separate `面评` section only after the factual record is complete. Apply the assessment rubric and role reference. Support strengths, risks, and recommendation with actual evidence. Mark untested dimensions `NT`; keep record uncertainty visible as an evaluation limit.

## Verify the Feishu result

Re-fetch the candidate document after writes. Verify the applicable mode against the sources:

- All selected bank questions remain verbatim and complete, with the bank link and available individual links.
- Section headings have no time budgets. `面试形式` has the exact default value unless Drake replaced it.
- Resume-tailored alternatives use gray text without wrapping parentheses. Inspect returned style properties or the rendered document to confirm the gray text.
- Each question and independently answerable subquestion has separate rendered `问：` and `答：` lines, using paragraphs or `<br/>` within a list block.
- `现场新增问题与追问` and a separate `面评` section exist.
- Before the interview, Q/A lines and assessment fields are blank, and no recommendation is selected.
- After the interview, actual questions, responses, follow-ups, and unplanned topics are captured. Coverage labels reflect the available evidence. Every material assessment claim has supporting evidence.
- The original resume attachment has the correct filename and remains at the end. Preserve an existing correct attachment rather than uploading a duplicate.
- The write target is the same candidate document across preparation and evaluation. The shared template and question bank remain unchanged.

A successful API response alone does not prove these conditions. Fix failed checks before reporting completion. State an exact blocker when verification is unavailable.
