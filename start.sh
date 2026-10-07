cd "$(dirname "$0")/backend" || exit 1
command -v node >/dev/null || { echo "Node.js is not installed. Get the LTS version from https://nodejs.org"; exit 1; }
[ -d node_modules ] || { echo "First run: installing packages..."; npm install; }
node server.js
