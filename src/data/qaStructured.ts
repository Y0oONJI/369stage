/**
 * qa_practical.md 의 categories JSON과 동기화.
 * 카테고리·섹션·항목 id는 체크리스트 항목 id 생성에 사용됨.
 */
import type { ChecklistItem, QaCategoryId } from '../types/task'

export const QA_CATEGORY_IDS: QaCategoryId[] = ['common', 'ui', 'print']

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
      title: 'UX/UI',
      sections: [
        {
          id: 'system',
          title: '디자인 시스템',
          items: [
            {
              id: 'component',
              label: '컴포넌트',
              originalText: '표준 라이브러리 컴포넌트 사용',
            },
            {
              id: 'state',
              label: '상태값',
              originalText: 'hover/active/disabled 등 상태값 포함',
            },
            {
              id: 'token',
              label: '토큰',
              originalText: '디자인 토큰 사용',
            },
          ],
        },
        {
          id: 'flow',
          title: '플로우',
          items: [
            {
              id: 'flow',
              label: '흐름',
              originalText: '플로우 단절 없음',
            },
            {
              id: 'error',
              label: '에러/빈상태',
              originalText: '에러/빈상태/로딩 포함',
            },
            {
              id: 'tone',
              label: '톤',
              originalText: '문구/버튼 톤 일관',
            },
          ],
        },
        {
          id: 'responsive',
          title: '반응형',
          items: [
            {
              id: 'break',
              label: '브레이크포인트',
              originalText: '브레이크포인트 깨짐 없음',
            },
            {
              id: 'auto',
              label: '오토레이아웃',
              originalText: '오토레이아웃 정상',
            },
          ],
        },
      ],
    },
    {
      id: 'print',
      title: '출력물',
      sections: [
        {
          id: 'spec',
          title: '인쇄 사양',
          items: [
            {
              id: 'size',
              label: '사이즈',
              originalText: '문서/재단 사이즈 정확',
            },
            {
              id: 'bleed',
              label: '블리드',
              originalText: '블리드/안전여백 확보',
            },
          ],
        },
        {
          id: 'color',
          title: '인쇄 컬러',
          items: [
            {
              id: 'cmyk',
              label: 'CMYK',
              originalText: 'CMYK/별색 설정 정확',
            },
            {
              id: 'black',
              label: '검정 처리',
              originalText: '검정 처리 및 오버프린트 확인',
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
