import os
import re

with open('vendors.html', 'r', encoding='utf-8') as f:
    vendors = f.read()

# Extract from <div class="overlay" to <main class="content">
match_top = re.search(r'(<div class="overlay" id="overlay".*?)<main class="content">', vendors, re.DOTALL)
top_shell = match_top.group(1) if match_top else ''
if not top_shell:
    print("Error: Could not extract top shell")

# Extract from </main><!-- /content --> to </body>
match_bottom = re.search(r'</main><!-- /content -->(.*?)</body>', vendors, re.DOTALL)
bottom_shell = match_bottom.group(1) if match_bottom else ''
if not bottom_shell:
    print("Error: Could not extract bottom shell")

# Fix active class
top_shell = top_shell.replace('class="nav-item active"', 'class="nav-item"')
top_shell = top_shell.replace('href="dashboard.html" class="nav-item"', 'href="dashboard.html" class="nav-item active"')
top_shell = top_shell.replace('Dashboard &rsaquo; <span>Vendors & Logistics</span>', 'Dashboard &rsaquo; <span>Overview</span>')

with open('dashboard.html', 'r', encoding='utf-8') as f:
    dash = f.read()

# I will clear everything before <main class="content">
# and everything after </main><!-- /content --> and rebuild it cleanly.

dash_main_match = re.search(r'(<main class="content">.*?</main><!-- /content -->)', dash, re.DOTALL)
dash_main = dash_main_match.group(1) if dash_main_match else ''

if not dash_main:
    print("Error: Could not find main block in dashboard.html")

new_dash = f"""<!DOCTYPE html>
<html lang="en">

<head>
  <!-- Login check handled elsewhere -->
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Shreeji Milk Center — Overview</title>
  <meta name="description" content="Production-grade Admin Dashboard for Shreeji Milk Center dairy delivery business." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/styles.css" />
  <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
  <script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
</head>
<body style="background: var(--bg-main);">
{top_shell}
{dash_main}
  </div><!-- /wrapper -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="js/supabase-integration.js"></script>
  <script src="js/data.js"></script>
  <script src="js/charts.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
"""

with open('dashboard.html', 'w', encoding='utf-8') as f:
    f.write(new_dash)

print("Dashboard rewritten successfully!")
