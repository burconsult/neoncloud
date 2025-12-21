# Clear Cache Instructions

If you're experiencing issues with encrypted files (they appear unencrypted when using `cat`), it's likely because the file was added to your game state before the encryption code was implemented.

## To Fix:

1. **Clear Browser Storage:**
   - Open your browser's Developer Tools (F12)
   - Go to the "Application" tab (Chrome) or "Storage" tab (Firefox)
   - Find "Local Storage" in the left sidebar
   - Click on your site's domain
   - Look for keys starting with `neoncloud-` and delete them all
   - Or use the console: `localStorage.clear()`

2. **Start Fresh:**
   - Restart the game
   - The welcome mission will start
   - When you read the email for the "First Hack" mission, the encrypted file will be properly encrypted

3. **Alternative - Export/Import:**
   - If you want to keep your progress, you can export your save file first
   - Then clear the cache and import it back (files will be re-encrypted on next email read)

## Verification:

After clearing cache and reading the email again, try:
- `cat server-01-credentials.enc` - Should show encrypted gibberish
- `crack server-01-credentials.enc` - Should decrypt it
- `cat server-01-credentials.enc` - Should now show the decrypted credentials

