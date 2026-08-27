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
import os
import asyncio
import threading
import logging
from playwright.async_api import async_playwright
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    ApplicationBuilder, CommandHandler, MessageHandler, 
    CallbackQueryHandler, ContextTypes, filters
)

# ----------------- CONFIGURATION -----------------
BOT_TOKEN = "8950038013:AAE5YwWdw2CuqkIrdYKPFdS5HvyRq1mVV2U"  # Aapka bot token
TARGET_URL = "https://gemixai.shop/swiggy"        # Aapka website URL

# Apne dono channels ki details yahan dalein
CHANNEL_1_USERNAME = "@swiggylooters06"  
CHANNEL_2_USERNAME = "@techhelperram" 
CHANNEL_1_LINK = "https://t.me/swiggylooters06"
CHANNEL_2_LINK = "https://t.me/techhelperram"
# -------------------------------------------------

# Active browser sessions storage
user_sessions = {}

logging.basicConfig(format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO)

# High-Traffic Optimization: Block images/styles
async def block_heavy_resources(route):
    if route.request.resource_type in ["image", "stylesheet", "font", "media"]:
        await route.abort()
    else:
        await route.continue_()

async def is_user_member(bot, user_id, channel_username):
    try:
        member = await bot.get_chat_member(chat_id=channel_username, user_id=user_id)
        return member.status in ['creator', 'administrator', 'member']
    except Exception:
        return False

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    
    # Existing session clean up
    if user_id in user_sessions:
        try:
            await user_sessions[user_id]["page"].close()
            await user_sessions[user_id]["browser"].close()
            await user_sessions[user_id]["playwright"].stop()
        except Exception:
            pass
        del user_sessions[user_id]

    # Check 2 Channels Join
    joined_1 = await is_user_member(context.bot, user_id, CHANNEL_1_USERNAME)
    joined_2 = await is_user_member(context.bot, user_id, CHANNEL_2_USERNAME)

    if not (joined_1 and joined_2):
        keyboard = [
            [InlineKeyboardButton("📢 Channel 1 Join Karein", url=CHANNEL_1_LINK)],
            [InlineKeyboardButton("📢 Channel 2 Join Karein", url=CHANNEL_2_LINK)],
            [InlineKeyboardButton("✅ Verify Join", callback_data="verify_join")]
        ]
        await update.message.reply_text(
            "⚠️ Bot use karne ke liye dono channels join karna zaroori hai:",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )
        return

    # Channel Joined -> Start Phone Input
    user_sessions[user_id] = {"step": "AWAITING_NUMBER"}
    await update.message.reply_text("👋 Kripya apna 10-digit Mobile Number enter karein:")

async def check_join_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    user_id = query.from_user.id

    joined_1 = await is_user_member(context.bot, user_id, CHANNEL_1_USERNAME)
    joined_2 = await is_user_member(context.bot, user_id, CHANNEL_2_USERNAME)

    if joined_1 and joined_2:
        await query.message.delete()
        user_sessions[user_id] = {"step": "AWAITING_NUMBER"}
        await query.message.reply_text("✅ Verification Successful!\n\n📲 Kripya apna 10-digit Mobile Number enter karein:")
    else:
        await query.message.edit_text(
            "❌ Aapne dono channels join nahi kiye hain. Dono join karke dubara 'Verify Join' dabayein.",
            reply_markup=query.message.reply_markup
        )

async def handle_user_input(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    text = update.message.text.strip()

    if user_id not in user_sessions:
        user_sessions[user_id] = {"step": "AWAITING_NUMBER"}

    current_step = user_sessions[user_id].get("step")

    # STEP 1: Process Mobile Number & Playwright Background Automation
    if current_step == "AWAITING_NUMBER":
        if not text.isdigit() or len(text) != 10:
            await update.message.reply_text("❌ Kripya sahi 10-digit Mobile Number enter karein.")
            return

        msg = await update.message.reply_text("⏳ Processing...")

        try:
            p = await async_playwright().start()
            browser = await p.chromium.launch(headless=True)
            context_browser = await browser.new_context()
            page = await context_browser.new_page()

            await page.route("**/*", block_heavy_resources)
            await page.goto(TARGET_URL, timeout=60000, wait_until="domcontentloaded")

            # Fill Mobile Number Input
            await page.fill('input[type="tel"], input[type="text"], input[name="mobile"]', text)

            # Click Submit/Send OTP Button
            await page.click('button[type="submit"], input[type="submit"], button:has-text("OTP"), button:has-text("Send")')

            user_sessions[user_id] = {
                "step": "AWAITING_OTP",
                "playwright": p,
                "browser": browser,
                "page": page,
                "phone": text
            }

            await msg.delete()
            await update.message.reply_text("✅ OTP bhej diya gaya hai. Kripya 6-digit OTP yahan enter karein:")

        except Exception as e:
            logging.error(f"Error on Step 1 for user {user_id}: {e}")
            await msg.edit_text("❌ Mobile number submit karne me problem aayi. Kripya dobara /start karein.")
            if user_id in user_sessions and "browser" in user_sessions[user_id]:
                await user_sessions[user_id]["browser"].close()
                await user_sessions[user_id]["playwright"].stop()
                del user_sessions[user_id]

    # STEP 2: Process OTP & 1-10 Timer Counting Animation
    elif current_step == "AWAITING_OTP":
        otp = text
        session_data = user_sessions.get(user_id)

        if not session_data or "page" not in session_data:
            await update.message.reply_text("❌ Session expire ho gaya. Kripya /start se dobara shuru karein.")
            return

        msg = await update.message.reply_text("⏳ Verifying...")

        try:
            page = session_data["page"]

            # Fill OTP Field
            await page.fill('input[name="otp"], input[type="number"], input[type="text"]', otp)

            # Click Verify/Submit OTP Button
            await page.click('button:has-text("Verify"), button:has-text("Submit"), button[type="submit"]')

            await page.wait_for_timeout(2000)

            # 1 se 10 counting animation
            for i in range(1, 11):
                await asyncio.sleep(0.4)
                await msg.edit_text(f"🔄 Processing... [{i}/10]")

            await msg.edit_text("🎉 **DONE!**\n\nAapka verification successfully complete ho gaya hai! ✅", parse_mode="Markdown")

        except Exception as e:
            logging.error(f"Error on Step 2 for user {user_id}: {e}")
            # Fallback animation agar timeout bhi aaye tab bhi user ko clean experience mile
            for i in range(1, 11):
                await asyncio.sleep(0.3)
                await msg.edit_text(f"🔄 Processing... [{i}/10]")
            await msg.edit_text("🎉 **DONE!**\n\nAapka verification complete ho gaya hai! ✅", parse_mode="Markdown")

        finally:
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
    app.add_handler(CallbackQueryHandler(check_join_callback, pattern="^verify_join$"))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_user_input))

    print("🚀 Playwright High-Performance Automation Bot Active...")
    app.run_polling()
                    
