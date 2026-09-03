"""
빛세움 홈페이지(seul24.cloud) 외곽선/구분선 농도 전환 스크립트.

- 외곽선1 = 원본(기본) 상태의 border/outline 색상.
- 외곽선2 = 외곽선1 대비 10% 짙게 조정한 상태
           (불투명 hex는 RGB x0.9, 반투명 rgba는 alpha x1.1, 각각 클램프).
  2026-09-03 대장 지시로 최초 생성, common.css/method.css/download-view.css +
  index.html + pages/*.html 전체 508개 border/outline 선언 대상.

사용법 (redevelopment 폴더의 실제 코드에 대해 in-place 적용, git diff로 결과 확인할 것):
    python border_outline_v1_v2.py to2   # 외곽선1 -> 외곽선2 (짙게)
    python border_outline_v1_v2.py to1   # 외곽선2 -> 외곽선1 (원복)

주의: 이 스크립트는 텍스트 치환 기반이라 실행 전 현재 코드가 정확히
어느 상태(1 또는 2)인지 git diff로 확인 후 실행할 것. 배포(vercel --prod)는
별도 승인 없이 하지 않는다 — [[feedback_bitseum_auto_deploy]] 예외 상황.
"""
import re, glob, sys, os

ROOT = r"C:\Users\dodo6\claude-projects\seul-homepage\redevelopment"

TARGET_FILES = [
    os.path.join(ROOT, "assets", "css", "common.css"),
    os.path.join(ROOT, "assets", "css", "method.css"),
    os.path.join(ROOT, "assets", "css", "download-view.css"),
    os.path.join(ROOT, "index.html"),
] + sorted(glob.glob(os.path.join(ROOT, "pages", "*.html")))

_PSEUDO_GUARD = (
    r'(?!hover\b|focus\b|focus-visible\b|focus-within\b|active\b|visited\b|before\b|after\b'
    r'|checked\b|disabled\b|not\(|first-child\b|last-child\b|nth-child\(|target\b|root\b'
    r'|placeholder\b|link\b|empty\b|only-child\b)'
)

PROP_RE = re.compile(
    r'(?P<prop>\bborder(?:-(?:top|bottom|left|right|color|top-color|bottom-color|left-color|right-color))?|outline(?:-color)?)'
    r'(?P<colon>\s*:\s*)'
    + _PSEUDO_GUARD +
    r'(?P<value>[^;"\'\{\}<]+)'
)

# 외곽선1(원본) -> 외곽선2(짙게). key/value 순서를 뒤집으면 2->1 복원.
VAR_MAP_1TO2 = [
    ("var(--gray-150,#eaedf0)", "#d3d5d8"),
    ("var(--gray-150, #eaedf0)", "#d3d5d8"),
    ("var(--gray-50)", "#e0e0e0"),
    ("var(--gray-100)", "#dbdbdb"),
    ("var(--gray-200)", "#cecece"),
    ("var(--gray-300)", "#bcbcbc"),
    ("var(--gray-400)", "#999999"),
    ("var(--gray-900)", "#171717"),
    ("var(--gold)", "#a6790a"),
]

HEX_MAP_1TO2 = {
    "#eee": "#d6d6d6", "#EEE": "#D6D6D6",
    "#E5E5E5": "#CECECE", "#e5e5e5": "#cecece",
    "#e2e5ea": "#cbced3",
    "#e6ebf2": "#cfd4da",
    "#e5e7eb": "#ced0d4",
    "#e2e8f0": "#cbd1d8",
    "#f0f2f6": "#d8dadd",
    "#D8D8D4": "#C2C2BF", "#d8d8d4": "#c2c2bf",
    "#fff": "#e6e6e6", "#FFF": "#E6E6E6",
    "#FFC400": "#E6B000",
    "#F5C518": "#DDB116",
    "#F0E0A0": "#D8CA90",
    "#F0D900": "#D8C300",
    "#C58B00": "#B17D00",
    "#B98500": "#A77800",
    "#171C26": "#151922",
    "#0A0F1C": "#090E19",
    "#B8860B": "#A6790A", "#b8860b": "#a6790a",
}

# outline2 쪽에서 var()로 되돌릴 수 없는 hex는 그대로 두되(원본이 var()였던
# 자리는 리터럴 hex로 남는다 - 디자인 변수 자체는 건드리지 않는다는 원칙 유지),
# 짙은 hex 리터럴 -> 원래 hex 리터럴 매핑만 역방향으로 되돌린다.
HEX_MAP_2TO1 = {v: k for k, v in HEX_MAP_1TO2.items()}
# var() 유래 항목은 2->1시 그 변수가 갖던 "원래 리터럴 값"으로 복원
VAR_ORIGINAL_LITERAL = {
    "#cecece": "#E5E5E5",       # --gray-200 / #E5E5E5 공용 짙은값 -> 대표 원복값
    "#dbdbdb": "#F3F3F3",       # --gray-100
    "#e0e0e0": "#F9F9F9",       # --gray-50
    "#bcbcbc": "#D1D1D1",       # --gray-300
    "#999999": "#AAAAAA",       # --gray-400
    "#171717": "#1A1A1A",       # --gray-900
    "#a6790a": "#B8860B",       # --gold / #B8860B 공용
    "#d3d5d8": "#eaedf0",       # --gray-150 fallback
}

RGBA_TRIPLES = ["184,134,11", "10,15,28", "20,28,38", "23,28,38", "20,38,68",
                "0,0,0", "255,255,255", "197,139,0"]
RGBA_RE = re.compile(
    r'rgba\(\s*(' + "|".join(t.replace(",", r"\s*,\s*") for t in RGBA_TRIPLES) + r')\s*,\s*([\d.]+)\s*\)'
)


def _fmt_alpha(a):
    s = f"{a:.3f}".rstrip("0").rstrip(".")
    return "0" if s in ("", "-0") else s


def bump_alpha_1to2(m):
    triple, a = m.group(1), float(m.group(2))
    new_a = min(1.0, round(a * 1.1, 3))
    triple_norm = re.sub(r'\s*,\s*', ',', triple)
    return f"rgba({triple_norm},{_fmt_alpha(new_a)})"


def bump_alpha_2to1(m):
    triple, a = m.group(1), float(m.group(2))
    new_a = max(0.0, round(a / 1.1, 3))
    triple_norm = re.sub(r'\s*,\s*', ',', triple)
    return f"rgba({triple_norm},{_fmt_alpha(new_a)})"


def darken_value(value):
    orig = value
    for old, new in VAR_MAP_1TO2:
        value = value.replace(old, new)
    for old, new in HEX_MAP_1TO2.items():
        value = re.sub(re.escape(old) + r'(?![0-9a-fA-F])', new, value)
    value = RGBA_RE.sub(bump_alpha_1to2, value)
    return value, value != orig


def lighten_value(value):
    orig = value
    for old, new in VAR_ORIGINAL_LITERAL.items():
        value = re.sub(re.escape(old) + r'(?![0-9a-fA-F])', new, value)
    for old, new in HEX_MAP_2TO1.items():
        value = re.sub(re.escape(old) + r'(?![0-9a-fA-F])', new, value)
    value = RGBA_RE.sub(bump_alpha_2to1, value)
    return value, value != orig


def process(path, transform):
    with open(path, encoding="utf-8") as f:
        text = f.read()

    changed_count = 0
    out = []
    pos = 0
    for m in PROP_RE.finditer(text):
        out.append(text[pos:m.start("value")])
        new_val, changed = transform(m.group("value"))
        out.append(new_val)
        if changed:
            changed_count += 1
        pos = m.end("value")
    out.append(text[pos:])
    new_text = "".join(out)

    if new_text != text:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_text)
    return changed_count


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "to2"
    transform = darken_value if mode == "to2" else lighten_value
    label = "외곽선1 -> 외곽선2 (짙게)" if mode == "to2" else "외곽선2 -> 외곽선1 (원복)"
    print(f"모드: {label}\n")

    total = 0
    for path in TARGET_FILES:
        if not os.path.isfile(path):
            print(f"MISSING: {path}")
            continue
        c = process(path, transform)
        if c:
            print(f"{c:4d} declarations changed - {os.path.relpath(path, ROOT)}")
        total += c
    print(f"\nTOTAL declarations touched: {total}")


if __name__ == "__main__":
    main()
