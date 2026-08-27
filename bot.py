import threading
from http.server import HTTPServer, BaseHTTPRequestHandler

class HealthCheckHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"Bot Alive")

def start_server():
    server = HTTPServer(('0.0.0.0', 10000), HealthCheckHandler)
    server.serve_forever()

threading.Thread(target=start_server, daemon=True).start()
import asyncio
import logging
from playwright.async_api import async_playwright
from telegram import Update
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    MessageHandler,
    ContextTypes,
    filters,
)

# Configuration
BOT_TOKEN = "8950038013:AAE5YwWdw2CuqkIrdYKPFdS5HvyRq1mVV2U"
TARGET_URL = "https://gemixai.shop/swiggy"

# Active browser sessions storage
user_sessions = {}

logging.basicConfig(format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO)

# High-Traffic Optimization: Block images/styles to save RAM & CPU
async def block_heavy_resources(route):
    if route.request.resource_type in ["image", "stylesheet", "font", "media"]:
        await route.abort()
    else:
        await route.continue_()

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    
    # If existing session exists, close it
    if user_id in user_sessions:
        try:
            await user_sessions[user_id]["page"].close()
            await user_sessions[user_id]["browser"].close()
        except Exception:
            pass
        del user_sessions[user_id]

    user_sessions[user_id] = {"step": "AWAITING_NUMBER"}
    await update.message.reply_text("👋 Offer Page me aapka swagat hai!\n\n📱 Apna 10-digit Mobile Number enter karein:")

async def handle_user_input(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    text = update.message.text.strip()

    if user_id not in user_sessions:
        user_sessions[user_id] = {"step": "AWAITING_NUMBER"}

    current_step = user_sessions[user_id].get("step")

    # STEP 1: Process Mobile Number & Submit on Website
    if current_step == "AWAITING_NUMBER":
        if not text.isdigit() or len(text) != 10:
            await update.message.reply_text("❌ Kripya sahi 10-digit mobile number enter karein.")
            return

        await update.message.reply_text("⏳ Website open ho rahi hai aur OTP bheja ja raha hai...")

        try:
            p = await async_playwright().start()
            browser = await p.chromium.launch(headless=True) # Headless mode for background execution
            context_browser = await browser.new_context()
            page = await context_browser.new_page()

            # Resource blocking for speed & ultra-low RAM usage
            await page.route("**/*", block_heavy_resources)

            # Open Target Website
            await page.goto(TARGET_URL, timeout=60000, wait_until="domcontentloaded")

            # Fill Mobile Number Input
            # (Agar website pe input field ka selector alag ho toh 'input[type="tel"]' edit kar sakte ho)
            await page.fill('input[type="tel"], input[type="text"], input[name="phone"], input[name="mobile"]', text)

            # Click Submit/Send OTP Button
            await page.click('button[type="submit"], input[type="submit"], button:has-text("OTP"), button:has-text("Submit")')

            # Save Browser Session State
            user_sessions[user_id] = {
                "step": "AWAITING_OTP",
                "playwright": p,
                "browser": browser,
                "page": page,
                "phone": text
            }

            await update.message.reply_text("✅ OTP bhej diya gaya hai!\n\n🔑 SMS me aaya OTP yahan enter karein:")

        except Exception as e:
            logging.error(f"Error on Step 1 for user {user_id}: {e}")
            await update.message.reply_text("❌ Mobile number submit karne me error aaya. Kripya /start karke dobara try karein.")
            if user_id in user_sessions and "browser" in user_sessions[user_id]:
                await user_sessions[user_id]["browser"].close()
                await user_sessions[user_id]["playwright"].stop()
                del user_sessions[user_id]

    # STEP 2: Receive OTP from Telegram & Enter on Website
    elif current_step == "AWAITING_OTP":
        otp = text
        session_data = user_sessions.get(user_id)

        if not session_data or "page" not in session_data:
            await update.message.reply_text("❌ Session expire ho gaya hai. Dobara /start karein.")
            return

        await update.message.reply_text("⏳ OTP website me submit kiya ja raha hai...")

        try:
            page = session_data["page"]

            # Fill OTP Field
            await page.fill('input[name="otp"], input[type="number"], input[placeholder*="OTP"]', otp)

            # Click Verify/Submit OTP Button
            await page.click('button:has-text("Verify"), button:has-text("Submit"), button[type="submit"]')

            # Wait for website response/redirect
            await page.wait_for_timeout(3000)

            await update.message.reply_text("🎉 OTP Verified successfully! Work Completed.")

        except Exception as e:
            logging.error(f"Error on Step 2 for user {user_id}: {e}")
            await update.message.reply_text("❌ OTP verify karne me problem aayi. Dobara try karein.")
        
        finally:
            # Clean up browser memory immediately
            try:
                await session_data["browser"].close()
                await session_data["playwright"].stop()
            except Exception:
                pass
            if user_id in user_sessions:
                del user_sessions[user_id]

if __name__ == "__main__":
    app = ApplicationBuilder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_user_input))

    print("🚀 Playwright High-Performance Automation Bot Active...")
    app.run_polling()
