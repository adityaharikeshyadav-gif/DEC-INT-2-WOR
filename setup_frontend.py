from pathlib import Path
import re

def process_nav(html):
    html = re.sub(r'data-path="style-calibration-quiz"\s+href="#"', 'data-path="style-calibration-quiz" href="/style-calibration-quiz"', html)
    html = re.sub(r'data-path="curated-art-style"\s+href="#"', 'data-path="curated-art-style" href="/curated-art-style"', html)
    html = re.sub(r'data-path="daily-art-style-update"\s+href="#"', 'data-path="daily-art-style-update" href="/daily-art-style-update"', html)
    html = re.sub(r'data-path="cinematic-drafting-suite"\s+href="#"', 'data-path="cinematic-drafting-suite" href="/story-studio"', html)
    html = re.sub(r'data-path="illuminated-storyboards"\s+href="#"', 'data-path="illuminated-storyboards" href="/story-studio"', html)
    return html

# 1. Quiz Folio
p_quiz = Path('stitch_deckoviz_taste_quizzes/deckoviz_studio_style_calibration_quiz_folio_edition/code.html')
quiz_html = process_nav(p_quiz.read_text(encoding='utf-8'))
quiz_html = quiz_html.replace(
    'imprintBtn.innerHTML = originalText;\n            }, 1800);',
    'window.location.href = "/curated-art-style";\n            }, 800);'
)

# 2. Curated Folio
p_folio = Path('stitch_deckoviz_taste_quizzes/deckoviz_studio_curated_art_folio_aesthetic_profile/code.html')
folio_html = process_nav(p_folio.read_text(encoding='utf-8'))
folio_html = re.sub(
    r'(<button[^>]*>\s*<span[^>]*>restart_alt</span>\s*<span>Re-open Calibration Quiz</span>\s*</button>)',
    r'<a href="/style-calibration-quiz" class="inline-block">\1</a>',
    folio_html
)
folio_html = re.sub(
    r'(<button[^>]*>\s*<span[^>]*>bookmark_add</span>\s*<span>Bind to Story Studio Now</span>\s*</button>)',
    r'<a href="/story-studio" class="inline-block">\1</a>',
    folio_html
)

# 3. Weekly Gazette
p_gazette = Path('stitch_deckoviz_taste_quizzes/deckoviz_studio_weekly_gazette_archival_dispatch/code.html')
gazette_html = process_nav(p_gazette.read_text(encoding='utf-8'))

# 4. Story Studio
p_studio = Path('stitch_deckoviz_taste_quizzes/deckoviz_studio_illuminated_story_studio_manuscript_forge/code.html')
studio_html = process_nav(p_studio.read_text(encoding='utf-8'))

# Write to static folder
from build_purple_ui_with_chatbot import upgrade_html_content

static_dir = Path('static')
static_dir.mkdir(parents=True, exist_ok=True)
(static_dir / 'index.html').write_text(upgrade_html_content(quiz_html), encoding='utf-8')
(static_dir / 'style-calibration-quiz.html').write_text(upgrade_html_content(quiz_html), encoding='utf-8')
(static_dir / 'curated-art-style.html').write_text(upgrade_html_content(folio_html), encoding='utf-8')
(static_dir / 'daily-art-style-update.html').write_text(upgrade_html_content(gazette_html), encoding='utf-8')
(static_dir / 'story-studio.html').write_text(upgrade_html_content(studio_html), encoding='utf-8')
(static_dir / 'cinematic-drafting-suite.html').write_text(upgrade_html_content(studio_html), encoding='utf-8')
(static_dir / 'illuminated-storyboards.html').write_text(upgrade_html_content(studio_html), encoding='utf-8')

print('Static files created and upgraded with purple theme & chatbot successfully!')

