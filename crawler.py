from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Launch browser
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
wait = WebDriverWait(driver, 10)

# --- 2. Go to login page ---
driver.get("https://idpaper.co.kr/user/login/login_form.html")
driver.implicitly_wait(3)

# --- 3. Enter ID and password ---
username = "kyuhee0622"
password = "pawpaw0715"


user_input = driver.find_element(By.ID, "userIdVal1")

# 아이디/비밀번호를 입력해준다.
driver.find_element(By.ID, "userIdVal1").send_keys(username)
driver.find_element(By.ID, "userPwVal1").send_keys(password)

# Click login button

# Click login button
# Try to find the login button. The structure is likely an <a> tag with an image inside the login box.
# We use a CSS selector targeting the <a> tag inside the login form structure.
try:
    login_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, ".login_box a[href='#']")))
    login_btn.click()
except:
    # Fallback to the user's XPath if the above fails, but using the correct method
    driver.find_element(By.XPATH, "//*[@id='loginFrm']//a[contains(@href, '#')]").click()


print("Logged in! Current URL:", driver.current_url)

# --- 4. Crawl text from result page ---
driver.get("https://idpaper.co.kr/test/result_all.html?testType=11")

# Wait for the content to load
wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "div.desc")))

# Find all elements matching div.desc and extract text
descriptions = driver.find_elements(By.CSS_SELECTOR, "div.desc")

print(f"Found {len(descriptions)} description blocks.")

with open("result.txt", "w", encoding="utf-8") as f:
    for i, desc in enumerate(descriptions):
        header = f"--- Block {i+1} ---\n"
        content = desc.text + "\n"
        footer = "-" * 20 + "\n"
        
        # Print to console
        print(header, end="")
        print(content, end="")
        print(footer, end="")
        
        # Write to file
        f.write(header)
        f.write(content)
        f.write(footer)

print("Saved results to result.txt")

# Keep browser open for a bit to verify
import time
time.sleep(5)