/**
 * qa_practical.md 의 categories JSON과 동기화.
 * 카테고리·섹션·항목 id는 체크리스트 항목 id 생성에 사용됨.
 */
import type { ChecklistItem, QaCategoryId } from '../types/task'

export const QA_CATEGORY_IDS: QaCategoryId[] = [
  'common', 'ui', 'print', 'video', 'photo', 'mockup', 'ppt', 'web', 'sns', 'dpp',
]

export function isQaCategoryId(v: string): v is QaCategoryId {
  return (QA_CATEGORY_IDS as readonly string[]).includes(v)
}

export const QA_STRUCTURED = {
  categories: [
    {
      id: 'common',
      title: '공통 QA',
      sections: [
        {
          id: 'text',
          title: '텍스트 / 언어 QA',
          required: true,
          items: [
            {
              id: 'typo',
              label: '오탈자/문법',
              originalText:
                '오탈자 전수 확인 (맞춤법 / 띄어쓰기 / 철자 / 문법)',
            },
            {
              id: 'punct',
              label: '구두점 규칙',
              originalText: '콜론·구두점 규칙 일관',
            },
            {
              id: 'case',
              label: '영문 대소문자',
              originalText: '영문 대소문자 규칙 일관',
            },
            {
              id: 'num_unit',
              label: '숫자/단위 표기',
              originalText: '숫자 · 단위 · 기호 표기 일관',
            },
            {
              id: 'lang_order',
              label: '다국어 순서',
              originalText: '다국어 표기 순서 일관',
            },
            {
              id: 'linebreak',
              label: '줄바꿈 자연스러움',
              originalText: '줄바꿈 자연스러움',
            },
          ],
        },
        {
          id: 'layout',
          title: '레이아웃 / 정렬',
          items: [
            {
              id: 'align',
              label: '정렬 기준',
              originalText: '좌/우/중앙 정렬 기준 일관',
            },
            {
              id: 'spacing',
              label: '여백/간격',
              originalText: '여백/패딩/간격 규칙 일관',
            },
            {
              id: 'overlap',
              label: '중복/겹침 없음',
              originalText: '오브젝트 중복 없음',
            },
            {
              id: 'overflow',
              label: '잘림 없음',
              originalText: '잘림/오버플로우 없음',
            },
          ],
        },
        {
          id: 'typo',
          title: '타이포 / 위계',
          items: [
            {
              id: 'font',
              label: '폰트 스타일',
              originalText: '폰트 패밀리/웨이트/자간/행간 일관',
            },
            {
              id: 'hierarchy',
              label: '위계',
              originalText: '위계 명확',
            },
            {
              id: 'read',
              label: '가독성',
              originalText: '캡션/각주/라벨 가독성 확보',
            },
          ],
        },
        {
          id: 'color',
          title: '컬러',
          items: [
            {
              id: 'mode',
              label: '컬러 모드',
              originalText: 'RGB/CMYK 목적 맞게 설정',
            },
            {
              id: 'contrast',
              label: '대비',
              originalText: '대비 부족 없음',
            },
          ],
        },
        {
          id: 'image',
          title: '이미지 / 영상',
          items: [
            {
              id: 'res',
              label: '해상도',
              originalText: '해상도 충분',
            },
            {
              id: 'ratio',
              label: '비율',
              originalText: '비율 왜곡 없음',
            },
            {
              id: 'format',
              label: '포맷',
              originalText: '포맷 목적 적합',
            },
            {
              id: 'latest',
              label: '최신 자료',
              originalText: '최신 자료 사용',
            },
          ],
        },
      ],
    },
    {
      id: 'ui',
      title: 'UX·UI 디자인 (Figma)',
      sections: [
        {
          id: 'design_system',
          title: '디자인 시스템 / 컴포넌트',
          items: [
            {
              id: 'ui_component',
              label: '표준 컴포넌트',
              originalText: '표준 라이브러리 컴포넌트 사용',
            },
            {
              id: 'ui_state',
              label: '상태값 누락 없음',
              originalText:
                '상태값 누락 없음 (hover / active / disabled / selected / error / loading)',
            },
            {
              id: 'ui_token',
              label: '디자인 토큰',
              originalText: '디자인 토큰 사용 (임의값 혼입 없음)',
            },
          ],
        },
        {
          id: 'interaction',
          title: '인터랙션 / 플로우',
          items: [
            {
              id: 'ui_flow',
              label: '플로우 단절 없음',
              originalText: '주요 플로우 단절 없음',
            },
            {
              id: 'ui_edge',
              label: '엣지 케이스 UI',
              originalText: '에러 / 빈 상태 / 로딩 / 권한 없음 UI 포함',
            },
            {
              id: 'ui_tone',
              label: '문구 톤 일관',
              originalText: '버튼·안내 문구 톤 일관',
            },
          ],
        },
        {
          id: 'responsive',
          title: '반응형',
          items: [
            {
              id: 'ui_breakpoint',
              label: '브레이크포인트',
              originalText: '주요 브레이크포인트 깨짐 없음',
            },
            {
              id: 'ui_autolayout',
              label: '오토레이아웃',
              originalText: '오토레이아웃 / 제약 정상',
            },
          ],
        },
      ],
    },
    {
      id: 'print',
      title: '출력물 / 인쇄물',
      sections: [
        {
          id: 'print_spec',
          title: '인쇄 사양',
          items: [
            {
              id: 'print_size',
              label: '문서 / 재단 사이즈',
              originalText: '문서 사이즈/재단 사이즈 정확',
            },
            {
              id: 'print_bleed',
              label: '블리드 / 안전 여백',
              originalText: '블리드(도련) 확보, 안전 여백 확보',
            },
            {
              id: 'print_layer',
              label: '후가공 레이어',
              originalText: '재단선/접지선/도무송/후가공 레이어 구분 (해당 시)',
            },
          ],
        },
        {
          id: 'print_color',
          title: '컬러 / 인쇄',
          items: [
            {
              id: 'print_cmyk',
              label: 'CMYK / 별색',
              originalText: 'CMYK/별색 설정 정확 (목적에 맞게)',
            },
            {
              id: 'print_black',
              label: '검정 처리',
              originalText:
                '검정 처리(본문 K100 등) 일관, 오버프린트 의도 확인 (해당 시)',
            },
            {
              id: 'print_thin',
              label: '가는 선 / 작은 글씨',
              originalText:
                '인쇄에서 가는 선/작은 글씨 문제 없는지 (최소 두께/최소 폰트 체크)',
            },
          ],
        },
        {
          id: 'print_font',
          title: '폰트 / 아웃라인 / 패키징',
          items: [
            {
              id: 'print_font_miss',
              label: '폰트 누락',
              originalText: '폰트 누락 없음 (패키징 또는 아웃라인 처리)',
            },
            {
              id: 'print_outline',
              label: 'Stroke 아웃라인',
              originalText: '일러스트 stroke outline/expand 필요 여부 확인',
            },
            {
              id: 'print_link',
              label: '링크 이미지 누락',
              originalText: '링크 이미지 누락 없음 (패키징/임베드)',
            },
          ],
        },
        {
          id: 'print_image',
          title: '이미지 품질',
          items: [
            {
              id: 'print_res',
              label: '인쇄용 해상도',
              originalText: '인쇄용 해상도 적정 (확대 시 깨짐 없음)',
            },
            {
              id: 'print_format',
              label: '출력 장비 포맷',
              originalText:
                '케어라벨/출력 장비 요구 포맷 준수 (TIFF/BMP 등 필요 시)',
            },
          ],
        },
        {
          id: 'print_export',
          title: '최종 파일',
          items: [
            {
              id: 'print_pdf',
              label: '출력용 PDF 생성',
              originalText:
                '출력용 PDF 생성 (페이지 순서/면수/여백 포함 확인)',
            },
            {
              id: 'print_pdf_check',
              label: 'PDF 텍스트 확인',
              originalText:
                'PDF에서 글자 깨짐/글리프 누락/오버셋 텍스트 없음',
            },
          ],
        },
        {
          id: 'print_verify',
          title: '검증',
          items: [
            {
              id: 'print_visual',
              label: '이미지 최종 확인',
              originalText:
                '최종 PDF 1개를 이미지로 확인 (오탈자/잘림/줄바꿈/정렬)',
            },
            {
              id: 'print_qr',
              label: 'QR / 바코드 스캔',
              originalText:
                'QR/바코드가 있으면 실제 스캔 테스트 (휴대폰 2종 이상 권장)',
            },
          ],
        },
      ],
    },
    {
      id: 'video',
      title: '영상 디자인 (After Effects)',
      sections: [
        {
          id: 'video_spec',
          title: '스펙',
          items: [
            {
              id: 'video_res',
              label: '해상도 / 비율 / FPS',
              originalText: '해상도/비율/프레임레이트/FPS 기획과 일치',
            },
            {
              id: 'video_length',
              label: '길이 / 러닝타임',
              originalText: '길이/러닝타임 정확',
            },
            {
              id: 'video_codec',
              label: '코덱 / 포맷',
              originalText: '코덱/포맷 (MP4/MOV 등) 요구사항 충족',
            },
          ],
        },
        {
          id: 'video_safe',
          title: '화면 안전 영역 / 가독성',
          items: [
            {
              id: 'video_safe_area',
              label: '자막 안전 영역',
              originalText:
                '자막/텍스트가 안전 영역 내 배치 (플랫폼별 잘림 방지)',
            },
            {
              id: 'video_read',
              label: '모바일 가독성',
              originalText:
                '작은 텍스트 가독성 확보 (특히 모바일 시청 기준)',
            },
          ],
        },
        {
          id: 'video_motion',
          title: '모션 / 전환 품질',
          items: [
            {
              id: 'video_drop',
              label: '깜빡임 / 프레임 드랍',
              originalText:
                '깜빡임/끊김/의도치 않은 프레임 드랍 없음',
            },
            {
              id: 'video_timing',
              label: '전환 타이밍',
              originalText:
                '전환 타이밍 과도하게 빠르거나 느리지 않음 (메시지 전달 가능)',
            },
          ],
        },
        {
          id: 'video_audio',
          title: '오디오 (해당 시)',
          items: [
            {
              id: 'video_sound',
              label: '음량 / 싱크',
              originalText: '음량/노이즈/싱크 문제 없음',
            },
            {
              id: 'video_peak',
              label: '무음 / 피크',
              originalText: '무음 구간/갑작스런 피크 없음',
            },
          ],
        },
        {
          id: 'video_render',
          title: '최종 렌더 확인',
          items: [
            {
              id: 'video_play',
              label: '전수 재생',
              originalText: '처음~끝 전수 재생 확인 (최소 1회)',
            },
            {
              id: 'video_thumb',
              label: '썸네일 프레임',
              originalText: '썸네일 프레임 의도대로 추출 (필요 시)',
            },
          ],
        },
      ],
    },
    {
      id: 'photo',
      title: '이미지 편집 (Photoshop)',
      sections: [
        {
          id: 'photo_res',
          title: '해상도 / 품질',
          items: [
            {
              id: 'photo_sharp',
              label: '해상도 / 샤프닝',
              originalText:
                '출력/웹 목적에 맞는 해상도, 샤프닝 과/부족 없음',
            },
            {
              id: 'photo_artifact',
              label: '압축 아티팩트',
              originalText: '압축 아티팩트/밴딩/노이즈 과다 없음',
            },
          ],
        },
        {
          id: 'photo_color',
          title: '색상 / 프로필',
          items: [
            {
              id: 'photo_profile',
              label: '컬러 프로필',
              originalText: 'RGB/CMYK/프로필 목적에 맞게 설정',
            },
            {
              id: 'photo_tone',
              label: '색상 왜곡',
              originalText:
                '피부/제품 색상 왜곡 없음 (레퍼런스와 비교)',
            },
          ],
        },
        {
          id: 'photo_mask',
          title: '마스킹 / 합성',
          items: [
            {
              id: 'photo_halo',
              label: '경계선 헤일로',
              originalText: '경계선 헤일로/잘린 픽셀 없음',
            },
            {
              id: 'photo_light',
              label: '그림자 / 광원',
              originalText: '그림자/광원 방향 자연스러움',
            },
          ],
        },
        {
          id: 'photo_format',
          title: '파일 포맷',
          items: [
            {
              id: 'photo_web',
              label: '웹 포맷',
              originalText: '웹: PNG/JPG/WEBP 목적에 맞게',
            },
            {
              id: 'photo_print_fmt',
              label: '출력 포맷',
              originalText: '출력: PNG/TIFF 등 요구 포맷 준수',
            },
            {
              id: 'photo_alpha',
              label: '투명 배경',
              originalText: '투명 배경 필요 시 알파 유지',
            },
          ],
        },
        {
          id: 'photo_batch',
          title: '대량 에셋 (해당 시)',
          items: [
            {
              id: 'photo_name',
              label: '파일명 규칙',
              originalText: '파일명 규칙 일관',
            },
            {
              id: 'photo_style',
              label: '스타일 일관',
              originalText: '스타일 (톤/채도/밝기/여백) 일관',
            },
            {
              id: 'photo_dup',
              label: '중복 / 오류 파일',
              originalText: '중복 이미지/잘못된 파일 섞임 없음',
            },
          ],
        },
      ],
    },
    {
      id: 'mockup',
      title: '공유용 시안 (목업 / 리뷰용 이미지 / PDF)',
      sections: [
        {
          id: 'mockup_quality',
          title: '목업 품질',
          items: [
            {
              id: 'mockup_frame',
              label: '프레임 이탈 없음',
              originalText: '화면이 프레임 밖으로 삐져나오지 않음',
            },
            {
              id: 'mockup_effect',
              label: '원근 / 반사',
              originalText: '원근/그림자/반사 과도하지 않음',
            },
            {
              id: 'mockup_read',
              label: '실사용 가독성',
              originalText: '실제 사용 환경에서 가독성 확보',
            },
          ],
        },
        {
          id: 'mockup_review',
          title: '리뷰 친화성',
          items: [
            {
              id: 'mockup_version',
              label: '버전 / 날짜 표기',
              originalText: '버전/날짜/담당 표기 (혼동 방지)',
            },
            {
              id: 'mockup_guide',
              label: '주석 / 가이드',
              originalText:
                '주석/가이드가 최종본에 남지 않음 (리뷰본/최종본 구분)',
            },
          ],
        },
      ],
    },
    {
      id: 'ppt',
      title: '발표용 자료 (PPT)',
      sections: [
        {
          id: 'ppt_layout',
          title: '레이아웃 / 그리드',
          items: [
            {
              id: 'ppt_margin',
              label: '마진 / 정렬',
              originalText: '모든 슬라이드에서 마진/정렬 기준 통일',
            },
            {
              id: 'ppt_style',
              label: '슬라이드 스타일',
              originalText: '슬라이드별 폰트/색상/아이콘 스타일 통일',
            },
          ],
        },
        {
          id: 'ppt_text',
          title: '텍스트 / 가독성',
          items: [
            {
              id: 'ppt_font_size',
              label: '글씨 크기',
              originalText: '너무 작은 글씨 없음 (발표 거리 기준)',
            },
            {
              id: 'ppt_linebreak',
              label: '줄바꿈',
              originalText: '줄바꿈 어색함/고아 줄 없음',
            },
          ],
        },
        {
          id: 'ppt_media',
          title: '링크 / 미디어',
          items: [
            {
              id: 'ppt_link',
              label: '링크 / QR',
              originalText: '링크 클릭 정상, QR 있으면 스캔 가능',
            },
            {
              id: 'ppt_asset',
              label: '영상 / 폰트 / 이미지',
              originalText:
                '영상/폰트/이미지 누락 없음 (상대 PC에서도 테스트)',
            },
          ],
        },
        {
          id: 'ppt_export',
          title: '내보내기',
          items: [
            {
              id: 'ppt_pdf',
              label: 'PDF 내보내기',
              originalText:
                'PDF로 내보냈을 때 깨짐/줄바꿈 변화 없음',
            },
          ],
        },
      ],
    },
    {
      id: 'web',
      title: '웹 (Framer)',
      sections: [
        {
          id: 'web_content',
          title: '콘텐츠 / 카피',
          items: [
            {
              id: 'web_typo',
              label: '오탈자 / 용어',
              originalText:
                '전체 텍스트 오탈자/대소문자/구두점/용어 일관',
            },
            {
              id: 'web_legal',
              label: '법적 리스크 문구',
              originalText:
                '금지어/과장 표현/법적 리스크 문구 없음 (필요 시 확인 절차)',
            },
          ],
        },
        {
          id: 'web_responsive',
          title: '반응형 / 브라우저',
          items: [
            {
              id: 'web_layout',
              label: '반응형 레이아웃',
              originalText:
                '모바일/태블릿/데스크톱에서 레이아웃 깨짐 없음',
            },
            {
              id: 'web_browser',
              label: '브라우저 호환',
              originalText:
                '주요 브라우저에서 폰트/줄바꿈/간격 문제 없음',
            },
          ],
        },
        {
          id: 'web_perf',
          title: '성능 / 자산',
          items: [
            {
              id: 'web_img',
              label: '이미지 최적화',
              originalText:
                '이미지 최적화 (용량 과다 없음), 로딩 지연 없음',
            },
            {
              id: 'web_link',
              label: '링크 / 404',
              originalText: '깨진 링크/404 없음',
            },
          ],
        },
        {
          id: 'web_a11y',
          title: '접근성 (최소)',
          items: [
            {
              id: 'web_contrast',
              label: '대비',
              originalText: '대비 부족 없음',
            },
            {
              id: 'web_touch',
              label: '터치 영역',
              originalText: '클릭 영역 너무 작지 않음 (모바일)',
            },
          ],
        },
      ],
    },
    {
      id: 'sns',
      title: 'SNS 콘텐츠 (Instagram / Canva)',
      sections: [
        {
          id: 'sns_canvas',
          title: '캔버스 / 안전 영역',
          items: [
            {
              id: 'sns_safe',
              label: '세이프존',
              originalText:
                '인스타그램 UI 요소 가림, 여백 고려 세이프존 확보 (상·하단/좌우)',
            },
          ],
        },
        {
          id: 'sns_carousel',
          title: '캐러셀 콘텐츠',
          items: [
            {
              id: 'sns_thumb',
              label: '썸네일 메시지',
              originalText: '썸네일 기준 핵심 메시지 인지',
            },
            {
              id: 'sns_tone',
              label: '커버 / 본편 톤',
              originalText:
                '커버–본편 톤 불일치 없음 (이미지/어조/레이아웃)',
            },
            {
              id: 'sns_logo',
              label: '로고 일관',
              originalText: '로고 사용 일관 (크기/위치/톤)',
            },
          ],
        },
        {
          id: 'sns_copy',
          title: '글',
          items: [
            {
              id: 'sns_miss',
              label: '내용 누락',
              originalText: '기획 원문 대비 누락 없음',
            },
            {
              id: 'sns_error',
              label: '내용 오류',
              originalText: '기획 원문 대비 오류 없음',
            },
          ],
        },
        {
          id: 'sns_video',
          title: '영상 리듬 (영상일 때만)',
          items: [
            {
              id: 'sns_cut',
              label: '컷 전환',
              originalText: '컷 전환·타이밍 자연스러움',
            },
            {
              id: 'sns_text_time',
              label: '텍스트 노출 시간',
              originalText: '텍스트 노출 시간 충분',
            },
          ],
        },
      ],
    },
    {
      id: 'dpp',
      title: 'DPP (케어라벨 / 스티커)',
      sections: [
        {
          id: 'dpp_sampling',
          title: '샘플링 / 검수 방식',
          items: [
            {
              id: 'dpp_sample_start',
              label: '초도 3장 확인',
              originalText: '초도 3장 실물 확인 (인쇄 시작 직후)',
            },
            {
              id: 'dpp_sample_mid',
              label: '중간 3장 확인',
              originalText: '중간 3장 실물 확인 (생산 중간 지점)',
            },
            {
              id: 'dpp_sample_end',
              label: '말기 3장 확인',
              originalText: '말기 3장 실물 확인 (생산 종료 직전)',
            },
            {
              id: 'dpp_recheck',
              label: '변경 시 재검수',
              originalText:
                '리본/잉크 교체, 온도·속도·압력 변경 시 즉시 재검수 (초도 3장)',
            },
          ],
        },
        {
          id: 'dpp_margin',
          title: '재단 / 여백 / 밀림',
          items: [
            {
              id: 'dpp_lr',
              label: '좌우 여백',
              originalText: '좌우 여백 ±2mm 이내 (샘플은 허용 없음)',
            },
            {
              id: 'dpp_tb',
              label: '상하 여백',
              originalText:
                '상·하 여백 균일 (재단/컷으로 정보 손실 없음)',
            },
            {
              id: 'dpp_shift',
              label: '인쇄 밀림',
              originalText: '인쇄가 밀리지 않음 (디자인 시안과 비교)',
            },
            {
              id: 'dpp_edge',
              label: '가장자리 간격',
              originalText:
                '텍스트/QR/라인이 라벨 가장자리와 과도하게 붙지 않음 (컷 오차 고려)',
            },
          ],
        },
        {
          id: 'dpp_text',
          title: '텍스트 가독성',
          items: [
            {
              id: 'dpp_pt',
              label: '최소 폰트 크기',
              originalText: '최소 5pt 이상 (샘플은 더 엄격 적용)',
            },
            {
              id: 'dpp_weight',
              label: '폰트 굵기',
              originalText:
                '굵기 medium 이상 (얇은 웨이트로 끊김/사라짐 없음)',
            },
            {
              id: 'dpp_spacing',
              label: '행간 / 자간',
              originalText: '행간/자간 적정 (붙음/뭉개짐/깨짐 없음)',
            },
            {
              id: 'dpp_clarity',
              label: '번짐 없이 또렷',
              originalText:
                '작은 글씨가 번짐 없이 또렷하게 인쇄됨 (문장/숫자 식별 가능)',
            },
          ],
        },
        {
          id: 'dpp_qr',
          title: 'QR 시인성 / 스캔 품질',
          items: [
            {
              id: 'dpp_qr_size',
              label: 'QR 크기',
              originalText: 'QR 크기 15mm 이상 확보',
            },
            {
              id: 'dpp_qr_quiet',
              label: 'Quiet zone',
              originalText: 'QR 주변 여백 (Quiet zone) 충분 (4면 모두 확보)',
            },
            {
              id: 'dpp_qr_module',
              label: '모듈 깨짐',
              originalText: '모듈 (작은 정사각형) 깨짐/번짐/끊김 없음',
            },
            {
              id: 'dpp_qr_contrast',
              label: '인쇄 농도',
              originalText:
                '인쇄 농도/대비 충분 (연한 인쇄로 모듈 경계 흐림 없음)',
            },
            {
              id: 'dpp_qr_scan',
              label: '스캔 테스트',
              originalText: '스캔 테스트 통과 (휴대폰 2종 이상 권장)',
            },
          ],
        },
        {
          id: 'dpp_var',
          title: '가변 데이터 (QR / ID) 검증',
          items: [
            {
              id: 'dpp_var_dup',
              label: '가변 QR 중복',
              originalText: '가변 QR이 모두 동일 코드로 출력되지 않음',
            },
            {
              id: 'dpp_var_id',
              label: '가변 ID 누락',
              originalText: '가변 ID 누락/중복/자리수 깨짐 없음',
            },
            {
              id: 'dpp_var_random',
              label: '랜덤 Index 검수',
              originalText: '랜덤 Index 스캔 검수 (여러 장 랜덤 선택)',
            },
            {
              id: 'dpp_var_link',
              label: '스캔 결과 연결',
              originalText:
                '스캔 결과가 올바른 레코드/페이지로 연결됨 (오류/404/타 제품 연결 없음)',
            },
          ],
        },
        {
          id: 'dpp_sewing',
          title: '봉제 / 부착 영역 (실물 기준)',
          items: [
            {
              id: 'dpp_sew_margin',
              label: '봉제선 여백',
              originalText: '봉제선 최소 5mm 확보 (권장 10mm)',
            },
            {
              id: 'dpp_sew_index',
              label: 'Index 가려짐',
              originalText:
                '봉제선 위/근처에 Index 번호가 가려지지 않게 배치됨',
            },
            {
              id: 'dpp_sew_qr',
              label: '봉제 후 QR 스캔',
              originalText:
                '봉제 후 접힘/구김 상태에서도 QR 스캔 가능',
            },
            {
              id: 'dpp_sew_text',
              label: '봉제 후 텍스트',
              originalText: '봉제 후 텍스트가 가려지거나 잘리지 않음',
            },
          ],
        },
        {
          id: 'dpp_defect',
          title: '출력 상태 / 결함 (현장 이슈)',
          items: [
            {
              id: 'dpp_smear',
              label: '번짐 / 스미어',
              originalText: '번짐/스미어 (마찰로 번짐) 없음',
            },
            {
              id: 'dpp_band',
              label: '헤드 라인 / 밴딩',
              originalText:
                '헤드 라인 (세로 줄), 밴딩, 점 누락 (핀홀) 없음',
            },
            {
              id: 'dpp_density',
              label: '잉크 농도',
              originalText:
                '잉크/리본 농도 균일 (구간별 진하기 차이 없음)',
            },
            {
              id: 'dpp_wrinkle',
              label: '주름 / 말림',
              originalText:
                '라벨 표면 주름/말림으로 인해 인쇄가 찌그러져 보이지 않음',
            },
          ],
        },
        {
          id: 'dpp_final',
          title: '최종 통과 기준',
          items: [
            {
              id: 'dpp_final_text',
              label: '텍스트 육안 판독',
              originalText: '텍스트 육안 판독 가능 (핵심 정보 식별)',
            },
            {
              id: 'dpp_final_qr',
              label: 'QR 스캔 100%',
              originalText:
                'QR 스캔 100% 성공 (샘플 기준은 전수 스캔 권장)',
            },
            {
              id: 'dpp_final_data',
              label: '가변 데이터 정확',
              originalText:
                '가변 ID/QR 데이터 정확 (랜덤 검수에서 불일치 0건)',
            },
            {
              id: 'dpp_final_cut',
              label: '밀림 / 잘림 없음',
              originalText: '밀림/잘림/결함 없음 (재단 오차 포함)',
            },
          ],
        },
      ],
    },
  ],
} as const

export function getCategoryTitle(categoryId: QaCategoryId): string {
  const c = QA_STRUCTURED.categories.find((x) => x.id === categoryId)
  return c?.title ?? categoryId
}

export function getCategorySelectOptions(): { id: QaCategoryId; title: string }[] {
  return QA_STRUCTURED.categories.map((c) => ({
    id: c.id as QaCategoryId,
    title: c.title,
  }))
}

/** 카테고리별 QA 템플릿 → 90% 최종 체크리스트 초기값 (항목 id는 재생성 시에도 동일) */
export function buildChecklistTemplate(categoryId: QaCategoryId): ChecklistItem[] {
  const cat = QA_STRUCTURED.categories.find((c) => c.id === categoryId)
  if (!cat) return []
  const out: ChecklistItem[] = []
  cat.sections.forEach((section, si) => {
    section.items.forEach((item, ii) => {
      const id = `${categoryId}-${section.id}-${item.id}`
      const displayCode = `${si + 1}-${ii + 1}`
      out.push({
        id,
        text: item.originalText,
        checked: false,
        label: item.label,
        sectionTitle: section.title,
        displayCode,
      })
    })
  })
  return out
}

/** 스토어에 저장된 항목이 해당 작업 카테고리 템플릿에서 온 것인지(구버전 수동 항목과 구분) */
export function isStructuredChecklistForTask(
  categoryId: QaCategoryId,
  checklist: ChecklistItem[],
): boolean {
  if (checklist.length === 0) return false
  const prefix = `${categoryId}-`
  return checklist.every((i) => i.id.startsWith(prefix))
}

/** 빈 배열이면 템플릿 UI(시드 대기), 항목이 있으면 템플릿 id 여부로 구분 */
export function checklistUiMode(
  categoryId: QaCategoryId,
  checklist: ChecklistItem[],
): 'structured' | 'legacy' {
  if (checklist.length === 0 || isStructuredChecklistForTask(categoryId, checklist)) {
    return 'structured'
  }
  return 'legacy'
}
