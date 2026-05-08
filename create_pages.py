import re

with open("settings.html", "r") as f:
    content = f.read()

# Make Settings not active
content = content.replace('href="settings.html" class="nav-item active"', 'href="settings.html" class="nav-item"')

# Create notifications.html
notif_content = content.replace('href="notifications.html" class="nav-item"', 'href="notifications.html" class="nav-item active"')
notif_content = notif_content.replace('Dashboard &rsaquo; <span>Settings</span>', 'Dashboard &rsaquo; <span>Notification Center</span>')
notif_content = notif_content.replace('<title>Shreeji Milk Center — Settings</title>', '<title>Shreeji Milk Center — Notification Center</title>')

# Replace main content for notifications
main_pattern = re.compile(r'(<main class="content">).*?(</main><!-- /content -->)', re.DOTALL)
notif_main = r'''\1
        <div class="section-title">Notification Center</div>
        <div class="card" style="padding: 24px; text-align: center; color: var(--text-muted);">
            <ion-icon name="notifications-outline" style="font-size: 48px; color: var(--border); margin-bottom: 16px;"></ion-icon>
            <p>No new notifications at this time.</p>
        </div>
\2'''
notif_content = main_pattern.sub(notif_main, notif_content)

with open("notifications.html", "w") as f:
    f.write(notif_content)

# Create app-settings.html
app_content = content.replace('href="app-settings.html" class="nav-item"', 'href="app-settings.html" class="nav-item active"')
app_content = app_content.replace('Dashboard &rsaquo; <span>Settings</span>', 'Dashboard &rsaquo; <span>Application Settings</span>')
app_content = app_content.replace('<title>Shreeji Milk Center — Settings</title>', '<title>Shreeji Milk Center — Application Settings</title>')

app_main = r'''\1
        <div class="section-title">Application Settings</div>
        <div class="card" style="padding: 24px; color: var(--text-muted);">
            <p>Application configuration and preferences will appear here.</p>
        </div>
\2'''
app_content = main_pattern.sub(app_main, app_content)

with open("app-settings.html", "w") as f:
    f.write(app_content)

print("Created notifications.html and app-settings.html")
