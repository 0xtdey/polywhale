#!/bin/bash
# Quick setup script for distribution

echo "🚀 PolyWhale - Distribution Setup"
echo "=================================================="
echo ""

# Check if GitHub username is configured
if grep -q "YOUR_GITHUB_USERNAME" package.json; then
    echo "⚠️  WARNING: GitHub username not configured!"
    echo ""
    echo "Please update package.json:"
    echo '  "publish": {'
    echo '    "provider": "github",'
    echo '    "owner": "YOUR_ACTUAL_USERNAME",  <-- Change this'
    echo '    "repo": "polywhale"'
    echo '  }'
    echo ""
    read -p "Enter your GitHub username (or press Enter to skip): " github_user
    
    if [ ! -z "$github_user" ]; then
        sed -i "s/YOUR_GITHUB_USERNAME/$github_user/g" package.json
        echo "✅ Updated package.json with username: $github_user"
    else
        echo "⏭️  Skipped GitHub configuration"
    fi
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Building application..."
npm run build:linux

echo ""
echo "✅ Build complete!"
echo ""
echo "📁 Distribution files created in dist/:"
ls -lh dist/*.deb dist/*.AppImage 2>/dev/null || echo "   (Check dist/ folder for output files)"

echo ""
echo "📖 Next Steps:"
echo "   1. Review DISTRIBUTION.md for detailed instructions"
echo "   2. Test installation: sudo dpkg -i dist/*.deb"
echo "   3. Set up GitHub token: export GH_TOKEN='your_token'"
echo "   4. Publish release: npm run build:publish"
echo ""
echo "🎉 Ready to distribute!"
