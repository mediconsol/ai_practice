-- Sample Programs for Testing
-- This script creates sample programs for demonstration

-- Note: You need to replace '9bdc4cba-91d6-4cc6-a913-0f70b5dc8254' with an actual user ID from your profiles table
-- Get user ID: SELECT id FROM profiles LIMIT 1;

-- 1. 환자 안내문 생성기 (Chat Type)
INSERT INTO programs (
  user_id,
  title,
  description,
  category,
  program_type,
  icon,
  gradient,
  is_public,
  is_new,
  config,
  usage_count
) VALUES (
  '9bdc4cba-91d6-4cc6-a913-0f70b5dc8254', -- Replace with actual user ID
  '환자 안내문 생성기',
  'AI가 환자에게 전달할 안내문을 HTML 형식으로 자동 생성합니다. 검사 안내, 수술 전후 주의사항, 복약 지도 등 다양한 안내문을 만들 수 있습니다.',
  '문서 작성',
  'chat',
  'FileText',
  'from-primary to-info',
  true,
  true,
  jsonb_build_object(
    'system_prompt', '당신은 의료 분야 전문가로, 환자들이 이해하기 쉬운 안내문을 작성하는 AI 어시스턴트입니다.

## 역할
- 환자 안내문을 명확하고 친절하게 작성
- 의학 용어는 쉬운 말로 풀어서 설명
- 중요한 정보는 강조하여 표시
- HTML 형식으로 깔끔하게 디자인

## 안내문 작성 규칙
1. 환자가 이해하기 쉬운 언어 사용
2. 중요 정보는 굵은 글씨나 색상으로 강조
3. 단계별 설명이 필요한 경우 번호 매기기
4. 연락처나 응급 상황 대처법 포함
5. 존중하고 따뜻한 어조 유지

## 출력 형식
안내문은 반드시 <artifact> 태그로 감싸서 HTML 형식으로 제공하세요.

예시:
<artifact type="html" title="[안내문 제목]">
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: ''Noto Sans KR'', sans-serif;
      line-height: 1.6;
      padding: 30px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      color: #2563eb;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 10px;
    }
    .highlight {
      background-color: #fef3c7;
      padding: 2px 6px;
      border-radius: 3px;
    }
    .important {
      background-color: #fee2e2;
      border-left: 4px solid #dc2626;
      padding: 15px;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  [안내문 내용]
</body>
</html>
</artifact>',
    'artifacts_enabled', true,
    'ai_provider', 'openai',
    'ai_model', 'gpt-4o'
  ),
  0
) ON CONFLICT DO NOTHING;

-- 2. 진료 기록 요약기 (Chat Type)
INSERT INTO programs (
  user_id,
  title,
  description,
  category,
  program_type,
  icon,
  gradient,
  is_public,
  is_new,
  config,
  usage_count
) VALUES (
  '9bdc4cba-91d6-4cc6-a913-0f70b5dc8254', -- Replace with actual user ID
  '진료 기록 요약기',
  '긴 진료 기록이나 환자 차트를 간결하게 요약하여 핵심 정보만 추출합니다.',
  '문서 처리',
  'chat',
  'ClipboardList',
  'from-success to-primary',
  true,
  true,
  jsonb_build_object(
    'system_prompt', '당신은 의료 진료 기록을 요약하는 전문 AI입니다. 긴 진료 기록에서 핵심 정보만 추출하여 명확하게 정리합니다.

## 요약 포함 항목
- 주요 증상 및 진단
- 처방 약물 및 치료 계획
- 검사 결과
- 추적 관찰 사항
- 주의사항

간결하지만 중요한 정보는 빠뜨리지 않도록 요약하세요.',
    'artifacts_enabled', false,
    'ai_provider', 'openai',
    'ai_model', 'gpt-4o'
  ),
  0
) ON CONFLICT DO NOTHING;

-- 3. 의학 논문 작성 도우미 (Chat Type)
INSERT INTO programs (
  user_id,
  title,
  description,
  category,
  program_type,
  icon,
  gradient,
  is_public,
  is_new,
  config,
  usage_count
) VALUES (
  '9bdc4cba-91d6-4cc6-a913-0f70b5dc8254', -- Replace with actual user ID
  '의학 논문 작성 도우미',
  '연구 논문의 초안 작성, 문헌 검토, 통계 분석 해석 등을 지원합니다.',
  '연구',
  'chat',
  'BookOpen',
  'from-warning to-destructive',
  true,
  false,
  jsonb_build_object(
    'system_prompt', '당신은 의학 연구 및 논문 작성을 지원하는 AI입니다. 학술적 글쓰기, 문헌 검토, 연구 방법론, 통계 분석 등을 도와줍니다.

## 지원 가능한 작업
- 논문 초안 작성 및 구조화
- 서론, 방법, 결과, 고찰 섹션 작성
- 문헌 검토 및 인용
- 통계 결과 해석
- 학술 영어 교정

학술적이고 객관적인 어조를 유지하며, 의학 논문 작성 규칙을 따릅니다.',
    'artifacts_enabled', true,
    'ai_provider', 'openai',
    'ai_model', 'gpt-4o'
  ),
  0
) ON CONFLICT DO NOTHING;

-- 4. 진단서 작성기 (Form Type)
INSERT INTO programs (
  user_id,
  title,
  description,
  category,
  program_type,
  icon,
  gradient,
  is_public,
  is_new,
  config,
  usage_count
) VALUES (
  '9bdc4cba-91d6-4cc6-a913-0f70b5dc8254', -- Replace with actual user ID
  '진단서 작성기',
  '환자 정보와 진단 내용을 입력하면 표준화된 진단서를 자동으로 생성합니다.',
  '문서 작성',
  'form',
  'Stethoscope',
  'from-info to-success',
  true,
  true,
  jsonb_build_object(
    'form_schema', jsonb_build_array(
      jsonb_build_object(
        'id', 'patient_name',
        'label', '환자명',
        'type', 'text',
        'required', true,
        'placeholder', '홍길동'
      ),
      jsonb_build_object(
        'id', 'patient_id',
        'label', '환자 번호',
        'type', 'text',
        'required', true,
        'placeholder', '2024-00001'
      ),
      jsonb_build_object(
        'id', 'patient_age',
        'label', '나이',
        'type', 'number',
        'required', true,
        'placeholder', '35',
        'validation', jsonb_build_object('min', 0, 'max', 150)
      ),
      jsonb_build_object(
        'id', 'patient_gender',
        'label', '성별',
        'type', 'select',
        'required', true,
        'options', jsonb_build_array('남성', '여성')
      ),
      jsonb_build_object(
        'id', 'diagnosis_date',
        'label', '진단 날짜',
        'type', 'date',
        'required', true
      ),
      jsonb_build_object(
        'id', 'chief_complaint',
        'label', '주요 증상',
        'type', 'textarea',
        'required', true,
        'placeholder', '예: 두통, 어지러움, 발열 등'
      ),
      jsonb_build_object(
        'id', 'diagnosis',
        'label', '진단명',
        'type', 'text',
        'required', true,
        'placeholder', '예: 급성 상기도 감염'
      ),
      jsonb_build_object(
        'id', 'treatment_plan',
        'label', '치료 계획',
        'type', 'textarea',
        'required', false,
        'placeholder', '예: 약물 치료, 경과 관찰 등'
      ),
      jsonb_build_object(
        'id', 'additional_notes',
        'label', '추가 소견',
        'type', 'textarea',
        'required', false,
        'placeholder', '추가로 기록할 내용이 있다면 입력하세요'
      )
    ),
    'output_template', '진단서',
    'system_prompt', '당신은 의료 진단서를 작성하는 전문 AI입니다. 입력받은 환자 정보와 진단 내용을 바탕으로 표준화된 진단서를 작성합니다.

## 진단서 작성 규칙
1. 공식적이고 전문적인 어조 사용
2. 환자 정보는 정확하게 기재
3. 진단명은 명확하게 표시
4. 치료 계획은 구체적으로 작성
5. 날짜는 YYYY-MM-DD 형식 사용

## 진단서 형식
다음과 같은 형식으로 작성하세요:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    진 단 서
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

환자 정보
  성명: [환자명]
  환자번호: [환자 번호]
  나이: [나이]세
  성별: [성별]

진단 정보
  진단일: [진단 날짜]
  주요 증상: [주요 증상]
  진단명: [진단명]

치료 계획
  [치료 계획]

추가 소견
  [추가 소견]

상기 환자를 진찰한 결과 위와 같이 진단하였음을 확인합니다.

발급일: [오늘 날짜]
의사: [서명란]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    'ai_provider', 'openai',
    'ai_model', 'gpt-4o'
  ),
  0
) ON CONFLICT DO NOTHING;

-- 5. 처방전 생성기 (Form Type)
INSERT INTO programs (
  user_id,
  title,
  description,
  category,
  program_type,
  icon,
  gradient,
  is_public,
  is_new,
  config,
  usage_count
) VALUES (
  '9bdc4cba-91d6-4cc6-a913-0f70b5dc8254', -- Replace with actual user ID
  '처방전 생성기',
  '환자 정보와 처방 내용을 입력하면 표준 처방전을 생성합니다.',
  '문서 작성',
  'form',
  'ClipboardList',
  'from-primary to-success',
  true,
  false,
  jsonb_build_object(
    'form_schema', jsonb_build_array(
      jsonb_build_object(
        'id', 'patient_name',
        'label', '환자명',
        'type', 'text',
        'required', true
      ),
      jsonb_build_object(
        'id', 'patient_age',
        'label', '나이',
        'type', 'number',
        'required', true
      ),
      jsonb_build_object(
        'id', 'diagnosis',
        'label', '병명',
        'type', 'text',
        'required', true
      ),
      jsonb_build_object(
        'id', 'medications',
        'label', '처방 약물',
        'type', 'textarea',
        'required', true,
        'placeholder', '약물명, 용량, 용법을 각 줄에 하나씩 입력하세요'
      ),
      jsonb_build_object(
        'id', 'duration',
        'label', '투약 기간 (일)',
        'type', 'number',
        'required', true,
        'placeholder', '7'
      )
    ),
    'output_template', '처방전',
    'system_prompt', '표준 의약품 처방전 형식으로 작성하세요. 약물명, 용량, 용법을 명확히 표시하고, 주의사항을 포함하세요.',
    'ai_provider', 'openai',
    'ai_model', 'gpt-4o'
  ),
  0
) ON CONFLICT DO NOTHING;

-- 6. 수술 동의서 생성기 (Template Type)
INSERT INTO programs (
  user_id,
  title,
  description,
  category,
  program_type,
  icon,
  gradient,
  is_public,
  is_new,
  config,
  usage_count
) VALUES (
  '9bdc4cba-91d6-4cc6-a913-0f70b5dc8254', -- Replace with actual user ID
  '수술 동의서 생성기',
  '다양한 수술 동의서 템플릿을 선택하고, AI와 대화하며 환자 맞춤형으로 수정할 수 있습니다.',
  '문서 작성',
  'template',
  'FileText',
  'from-warning to-primary',
  true,
  true,
  jsonb_build_object(
    'templates', jsonb_build_array(
      -- 템플릿 1: 일반 수술 동의서
      jsonb_build_object(
        'id', 'general_surgery_consent',
        'name', '일반 수술 동의서',
        'description', '일반적인 수술에 사용되는 기본 동의서 템플릿',
        'content', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    수술 동의서
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

환자 정보
  성명: [환자명]
  생년월일: [생년월일]
  환자번호: [환자번호]

수술 정보
  수술명: [수술명]
  수술 예정일: [수술일시]
  집도의: [담당의사명]
  수술 부위: [수술부위]

1. 수술의 필요성
본인은 담당 의사로부터 위 수술이 필요한 이유와 목적에 대하여 충분한 설명을 들었으며, 수술의 필요성을 이해하였습니다.

주요 진단: [진단명]
수술 목적: [수술목적]

2. 수술 방법
담당 의사는 다음과 같은 수술 방법과 과정에 대하여 설명하였으며, 본인은 이를 이해하였습니다:

[수술방법설명]

3. 예상되는 효과 및 합병증
본인은 수술로 인해 예상되는 효과와 발생 가능한 합병증에 대하여 설명을 들었습니다.

예상 효과:
• [예상효과1]
• [예상효과2]

발생 가능한 합병증 및 부작용:
• 출혈, 감염, 통증
• 마취 관련 합병증
• [특정합병증]

4. 대체 가능한 치료 방법
본인은 수술 외에 가능한 다른 치료 방법에 대해서도 설명을 들었으며, 각 방법의 장단점을 이해하였습니다.

5. 동의 확인
본인은 위 내용을 충분히 이해하였으며, 자발적으로 이 수술에 동의합니다.

환자 서명: ________________    날짜: ________________

보호자 서명: ________________  관계: ________________

담당의사 서명: ________________  날짜: ________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
발급일자: [발급일자]
발급기관: [병원명]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        'variables', jsonb_build_array(
          '환자명', '생년월일', '환자번호', '수술명', '수술일시',
          '담당의사명', '수술부위', '진단명', '수술목적', '수술방법설명',
          '예상효과1', '예상효과2', '특정합병증', '발급일자', '병원명'
        )
      ),
      -- 템플릿 2: 복강경 수술 동의서
      jsonb_build_object(
        'id', 'laparoscopic_surgery_consent',
        'name', '복강경 수술 동의서',
        'description', '최소침습 복강경 수술을 위한 전문 동의서',
        'content', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              복강경 수술 동의서
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

환자 정보
  성명: [환자명]
  생년월일: [생년월일]
  환자번호: [환자번호]

수술 정보
  수술명: 복강경 [수술명]
  수술 예정일: [수술일시]
  집도의: [담당의사명]

1. 복강경 수술의 이해
본인은 담당 의사로부터 복강경 수술에 대한 충분한 설명을 들었으며, 다음 사항을 이해하였습니다:

• 복강경 수술은 작은 절개를 통해 카메라와 수술 기구를 삽입하여 시행하는 최소침습 수술입니다.
• 기존 개복 수술에 비해 회복이 빠르고 흉터가 작은 장점이 있습니다.

진단명: [진단명]
수술 목적: [수술목적]

2. 수술 과정
[수술과정설명]

주요 절개 부위: [절개부위]
예상 수술 시간: [예상시간]

3. 복강경 수술의 장점
• 작은 절개로 인한 미용적 효과
• 빠른 회복과 조기 퇴원
• 수술 후 통증 감소
• 감염 위험 감소

4. 복강경 수술 관련 합병증
본인은 복강경 수술 시 발생할 수 있는 다음의 합병증에 대해 설명을 들었습니다:

일반적 합병증:
• 출혈, 감염, 통증
• 가스 주입으로 인한 불편감
• 주변 장기 손상 가능성

특수 합병증:
• [특정합병증1]
• [특정합병증2]

5. 개복 수술로의 전환 가능성
본인은 복강경 수술 중 예기치 못한 상황이 발생할 경우, 안전을 위해 개복 수술로 전환될 수 있음을 이해하였습니다.

전환 사유: 심한 유착, 출혈, 시야 확보 어려움 등

6. 동의 확인
본인은 위 내용을 충분히 이해하였으며, 자발적으로 복강경 수술에 동의합니다.

환자 서명: ________________    날짜: ________________

보호자 서명: ________________  관계: ________________

담당의사 서명: ________________  날짜: ________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
발급일자: [발급일자]
발급기관: [병원명]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        'variables', jsonb_build_array(
          '환자명', '생년월일', '환자번호', '수술명', '수술일시',
          '담당의사명', '진단명', '수술목적', '수술과정설명',
          '절개부위', '예상시간', '특정합병증1', '특정합병증2',
          '발급일자', '병원명'
        )
      ),
      -- 템플릿 3: 마취 동의서
      jsonb_build_object(
        'id', 'anesthesia_consent',
        'name', '마취 동의서',
        'description', '수술 전 마취에 대한 동의서 (전신마취 및 부분마취)',
        'content', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  마취 동의서
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

환자 정보
  성명: [환자명]
  생년월일: [생년월일]
  환자번호: [환자번호]
  연락처: [연락처]

마취 정보
  마취 종류: [마취종류]
  예정 수술명: [수술명]
  수술 예정일: [수술일시]
  마취과 의사: [마취과의사명]

1. 마취의 필요성
본인은 담당 마취과 의사로부터 수술에 필요한 마취에 대하여 충분한 설명을 들었으며, 마취의 필요성을 이해하였습니다.

2. 마취 방법
본인에게 적용될 마취 방법: [마취종류]

[마취종류에 따른 설명]

전신마취의 경우:
• 약물을 통해 의식을 완전히 잃게 하는 마취
• 인공호흡기를 사용할 수 있음
• 수술 중 통증을 느끼지 않음

부분마취(척추/경막외 마취)의 경우:
• 척추 주변에 국소마취제를 주입
• 하반신의 감각과 운동이 일시적으로 차단됨
• 의식은 유지되나 필요시 수면제 투여 가능

3. 마취 전 주의사항
본인은 다음 사항에 대해 설명을 들었습니다:

• 수술 전 금식 시간: [금식시간]
• 복용 중인 약물: [복용약물]
• 알레르기 유무: [알레르기여부]
• 과거 마취 경험: [과거마취이력]

4. 마취 관련 합병증 및 부작용
본인은 마취 시 발생할 수 있는 합병증과 부작용에 대해 설명을 들었습니다.

일반적 부작용:
• 오심, 구토
• 인후통, 쉰 목소리
• 일시적 기억력 저하
• 두통, 어지러움

드물지만 심각한 합병증:
• 치아 손상
• 기도 손상
• 알레르기 반응
• 심혈관계 합병증
• 신경 손상 (부분마취 시)

5. 마취과 의사의 재량
본인은 수술 및 마취 중 환자의 상태에 따라 마취과 의사가 마취 방법을 변경하거나 추가 처치를 할 수 있음을 이해하였습니다.

6. 수술 후 통증 관리
본인은 수술 후 통증 관리 방법에 대해 설명을 들었으며, 필요시 진통제나 자가통증조절장치(PCA)를 사용할 수 있음을 이해하였습니다.

7. 동의 확인
본인은 위 내용을 충분히 이해하였으며, 자발적으로 마취에 동의합니다.

환자 서명: ________________    날짜: ________________

보호자 서명: ________________  관계: ________________

마취과 의사 서명: ________________  날짜: ________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
발급일자: [발급일자]
발급기관: [병원명]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        'variables', jsonb_build_array(
          '환자명', '생년월일', '환자번호', '연락처', '마취종류',
          '수술명', '수술일시', '마취과의사명', '금식시간', '복용약물',
          '알레르기여부', '과거마취이력', '발급일자', '병원명'
        )
      )
    ),
    'system_prompt', '당신은 의료 문서 작성 전문 AI입니다. 사용자가 선택한 수술 동의서 템플릿을 환자 맞춤형으로 수정하도록 도와줍니다.

## 역할
- 템플릿의 변수(대괄호 [] 안의 내용)를 실제 정보로 채우기
- 사용자 요청에 따라 문구 수정 및 보완
- 의학적으로 정확하고 법적으로 적절한 표현 사용
- 환자가 이해하기 쉬운 언어 사용

## 수정 규칙
1. 변수는 대괄호 형식([변수명])을 유지하거나 실제 값으로 대체
2. 전문 의학 용어는 쉬운 설명 추가
3. 법적 문구는 보존하되, 이해를 돕는 설명 추가 가능
4. 전체 구조와 형식은 최대한 유지
5. 사용자가 요청한 부분만 수정

## 응답 방식
사용자의 수정 요청을 받으면, 수정된 전체 템플릿 내용을 제공하세요. 변경 사항에 대한 간단한 설명을 먼저 하고, 그 다음 전체 템플릿을 출력하세요.

예시:
"환자명을 홍길동으로, 수술명을 맹장 수술로 변경하였습니다.

[수정된 전체 템플릿 내용]"',
    'ai_provider', 'openai',
    'ai_model', 'gpt-4o'
  ),
  0
) ON CONFLICT DO NOTHING;

COMMIT;
