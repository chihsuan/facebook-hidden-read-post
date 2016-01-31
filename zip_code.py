import zipfile
import os

# add more dirs ....
dirs = ['icons']

def zipdir(path, ziph):
    # ziph is zipfile handle
    for root, dirs, files in os.walk(path):
        for file in files:
            ziph.write(os.path.join(root, file))


zf = zipfile.ZipFile('code.zip', 'w')
for d in dirs:
    zipdir(d, zf)

# if you want to add more file
zf.write('content.js')
zf.write('jquery.min.js')
zf.write('manifest.json')
zf.close()
