import os
import glob

html_files = glob.glob("*.html")

target = """        <a href="transactions.html" class="nav-item{active_trans}" style="text-decoration: none;">
          <span class="nav-icon"><ion-icon name="card-outline"></ion-icon></span><span class="nav-label">Transactions
            and Reports</span>
        </a>"""

replacement_template = """        <a href="transactions.html" class="nav-item{active_trans}" style="text-decoration: none;">
          <span class="nav-icon"><ion-icon name="card-outline"></ion-icon></span><span class="nav-label">Transactions
            and Reports</span>
        </a>
        <a href="notifications.html" class="nav-item{active_notif}" style="text-decoration: none;">
          <span class="nav-icon"><ion-icon name="notifications-outline"></ion-icon></span><span class="nav-label">Notification Center</span>
        </a>
        <a href="app-settings.html" class="nav-item{active_appset}" style="text-decoration: none;">
          <span class="nav-icon"><ion-icon name="options-outline"></ion-icon></span><span class="nav-label">Application Settings</span>
        </a>"""

for file in html_files:
    with open(file, "r") as f:
        content = f.read()
    
    if '<nav class="nav-menu">' not in content:
        continue
        
    # Check if we have active state on transactions
    if 'href="transactions.html" class="nav-item active"' in content:
        target_str = target.replace("{active_trans}", " active")
        rep_str = replacement_template.replace("{active_trans}", " active").replace("{active_notif}", "").replace("{active_appset}", "")
    else:
        target_str = target.replace("{active_trans}", "")
        rep_str = replacement_template.replace("{active_trans}", "").replace("{active_notif}", "").replace("{active_appset}", "")
        
    if target_str in content:
        new_content = content.replace(target_str, rep_str)
        with open(file, "w") as f:
            f.write(new_content)
        print(f"Updated {file}")
    else:
        print(f"Target not found in {file}, might have different spacing")
