import os

files_to_delete = [
    "app/src/main/res/font/gflex_variable.ttf",
    "app/src/main/res/font/genre_variable.ttf",
    "wear/src/main/res/font/gflex_variable.ttf",
    "app/src/main/res/drawable/theveloper_icon.png"
]

print("Starting asset cleanup...")
for file_path in files_to_delete:
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
            print(f"Successfully deleted: {file_path}")
        except Exception as e:
            print(f"Error deleting {file_path}: {e}")
    else:
        print(f"File not found (already deleted): {file_path}")
print("Cleanup complete!")
