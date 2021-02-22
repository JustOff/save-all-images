@echo off
set VER=1.0.7

sed -i -E "s/version>.+?</version>%VER%</" install.rdf
sed -i -E "s/version>.+?</version>%VER%</; s/download\/.+?\/save-all-images-.+?\.xpi/download\/%VER%\/save-all-images-%VER%\.xpi/" update.xml

set XPI=save-all-images-%VER%.xpi
if exist %XPI% del %XPI%
zip -r9q %XPI% * -x .git/* .gitignore update.xml LICENSE README.md ChangeLog.txt *.cmd *.xpi *.exe
