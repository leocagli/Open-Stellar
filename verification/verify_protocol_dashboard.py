from playwright.sync_api import sync_playwright
import time

def run_cuj(page):
    # Navigate to protocol dashboard
    print("Navigating to /protocol...")
    page.goto("http://localhost:3000/protocol")
    page.wait_for_timeout(2000)

    # Trigger some reputation events to populate the feed using page.evaluate
    print("Triggering reputation events via fetch...")
    page.evaluate("""
        async () => {
            for (let i = 0; i < 3; i++) {
                await fetch('/api/protocol/reputation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        actorId: `bot-${i}`,
                        delta: 15,
                        reason: "Verification test",
                        scope: "tx"
                    })
                });
                await new Promise(r => setTimeout(r, 1000));
            }
        }
    """)

    # Wait for polling (10s interval)
    print("Waiting for polling...")
    page.wait_for_timeout(12000)

    # Take screenshot of the dashboard with the live feed populated
    page.screenshot(path="verification/screenshots/protocol_dashboard.png", full_page=True)
    print("Screenshot saved to verification/screenshots/protocol_dashboard.png")

    # Hold for video
    page.wait_for_timeout(2000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
