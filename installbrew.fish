#!/usr/bin/env fish

# Install Homebrew on Ubuntu Linux
# This script handles the complete installation process

function install_homebrew
    echo "🍺 Installing Homebrew on Ubuntu..."
    
    # Check if running on Ubuntu
    if not test -f /etc/lsb-release
        echo "❌ This script is designed for Ubuntu. Exiting."
        return 1
    end
    
    # Update package list
    echo "📦 Updating package list..."
    sudo apt update
    
    # Install required dependencies
    echo "🔧 Installing required dependencies..."
    sudo apt install -y build-essential procps curl file git
    
    # Download and install Homebrew
    echo "⬇️  Downloading and installing Homebrew..."
    /bin/bash -c (curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh | psub)
    
    # Add Homebrew to PATH for current session
    echo "🔗 Adding Homebrew to PATH..."
    
    # Determine the correct Homebrew path based on architecture
    if test (uname -m) = "x86_64"
        set brew_path "/home/linuxbrew/.linuxbrew"
    else
        set brew_path "/home/linuxbrew/.linuxbrew"
    end
    
    # Add to current session PATH
    set -gx PATH $brew_path/bin $PATH
    
    # Add to fish config for persistence
    echo "💾 Adding Homebrew to Fish config..."
    if not grep -q "linuxbrew" ~/.config/fish/config.fish 2>/dev/null
        echo "" >> ~/.config/fish/config.fish
        echo "# Homebrew" >> ~/.config/fish/config.fish
        echo "set -gx PATH $brew_path/bin \$PATH" >> ~/.config/fish/config.fish
    end
    
    # Verify installation
    echo "✅ Verifying Homebrew installation..."
    if command -v brew >/dev/null 2>&1
        echo "🎉 Homebrew installed successfully!"
        brew --version
        echo ""
        echo "🔍 Run 'brew doctor' to check for any issues"
        echo "📚 Run 'brew help' to get started"
    else
        echo "❌ Homebrew installation failed. Please check the output above."
        return 1
    end
end

# Run the installation
install_homebrew
