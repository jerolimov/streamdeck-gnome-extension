all: build disable copy enable

build:
	gnome-extensions pack --force

install:
	gnome-extensions install "streamdeck-gnome-extension@jerolimov.de.shell-extension.zip"

copy:
	mkdir -pv "${HOME}/.local/share/gnome-shell/extensions/streamdeck-gnome-extension@jerolimov.de/"
	cp -v README.md LICENSE metadata.json extension.js "${HOME}/.local/share/gnome-shell/extensions/streamdeck-gnome-extension@jerolimov.de/"

enable:
	gnome-extensions enable "streamdeck-gnome-extension@jerolimov.de"

disable:
	gnome-extensions enable "streamdeck-gnome-extension@jerolimov.de"
