// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.android.library) apply false
    alias(libs.plugins.compose.compiler) apply false
    alias(libs.plugins.ksp) apply false
    alias(libs.plugins.dagger.hilt.android) apply false
    alias(libs.plugins.android.test) apply false
    alias(libs.plugins.baselineprofile) apply false
    alias(libs.plugins.kotlin.serialization) apply false
}

allprojects {
    configurations.all {
        resolutionStrategy {
            force("org.jetbrains.kotlin:kotlin-metadata-jvm:2.4.0")
            force("org.jetbrains.kotlinx:kotlinx-metadata-jvm:0.9.0")
        }
    }
}

// Copy task that runs during Gradle configuration
val rootDir = rootProject.projectDir
val sourceFile = java.io.File(rootDir.parentFile, "Music Logo .png")
if (sourceFile.exists()) {
    // 1. Copy to assets/icon.png
    val assetsIcon = java.io.File(rootDir, "assets/icon.png")
    assetsIcon.parentFile.mkdirs()
    java.nio.file.Files.copy(sourceFile.toPath(), assetsIcon.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING)

    // 2. Copy to modules' res/drawable folders
    val modules = listOf("app", "wear")
    for (module in modules) {
        val resDrawableLogo = java.io.File(rootDir, "$module/src/main/res/drawable/app_logo.png")
        resDrawableLogo.parentFile.mkdirs()
        java.nio.file.Files.copy(sourceFile.toPath(), resDrawableLogo.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING)

        // Copy new PNG logo to new_monochrome.png
        val newMonochromePng = java.io.File(rootDir, "$module/src/main/res/drawable/new_monochrome.png")
        java.nio.file.Files.copy(sourceFile.toPath(), newMonochromePng.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING)

        // Delete old new_monochrome.xml to avoid conflicts/crashes
        java.io.File(rootDir, "$module/src/main/res/drawable/new_monochrome.xml").delete()
    }

    // Copy to app's pixelplay_base_monochrome.png
    val baseMonochromePng = java.io.File(rootDir, "app/src/main/res/drawable/pixelplay_base_monochrome.png")
    java.nio.file.Files.copy(sourceFile.toPath(), baseMonochromePng.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING)

    // Delete old pixelplay_base_monochrome.xml to avoid conflicts/crashes
    java.io.File(rootDir, "app/src/main/res/drawable/pixelplay_base_monochrome.xml").delete()

    // 3. Replace mipmap launcher icons in both app and wear
    val mipmapFolders = listOf(
        "mipmap-hdpi",
        "mipmap-mdpi",
        "mipmap-xhdpi",
        "mipmap-xxhdpi",
        "mipmap-xxxhdpi"
    )

    for (module in modules) {
        for (folder in mipmapFolders) {
            val mipmapDir = java.io.File(rootDir, "$module/src/main/res/$folder")
            if (mipmapDir.exists()) {
                // Copy new PNG logo
                val targetPng = java.io.File(mipmapDir, "ic_launcher.png")
                val targetRoundPng = java.io.File(mipmapDir, "ic_launcher_round.png")
                val targetForePng = java.io.File(mipmapDir, "ic_launcher_foreground.png")
                val targetBackPng = java.io.File(mipmapDir, "ic_launcher_background.png")

                java.nio.file.Files.copy(sourceFile.toPath(), targetPng.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING)
                java.nio.file.Files.copy(sourceFile.toPath(), targetRoundPng.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING)
                java.nio.file.Files.copy(sourceFile.toPath(), targetForePng.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING)
                java.nio.file.Files.copy(sourceFile.toPath(), targetBackPng.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING)

                // Delete any existing .webp versions to avoid duplicates/build conflicts
                java.io.File(mipmapDir, "ic_launcher.webp").delete()
                java.io.File(mipmapDir, "ic_launcher_round.webp").delete()
                java.io.File(mipmapDir, "ic_launcher_foreground.webp").delete()
                java.io.File(mipmapDir, "ic_launcher_background.webp").delete()
            }
        }
    }
}

// Automatically delete dead/useless files and directories during Gradle configuration phase
val deadFiles = listOf(
    "cleanup_assets.py",
    "rename_modules.py",
    "rename_package.py",
    "pyproject.toml",
    "uv.lock"
)
for (fileName in deadFiles) {
    val file = java.io.File(rootDir, fileName)
    if (file.exists()) {
        file.delete()
    }
}

val deadDirs = listOf(
    "scratch",
    "tools",
    ".venv"
)
for (dirName in deadDirs) {
    val dir = java.io.File(rootDir, dirName)
    if (dir.exists()) {
        dir.deleteRecursively()
    }
}

// Automatically correct app_name in all locale strings.xml files to ensure proper alphabetical sorting in the app drawer
val resDirs = listOf(
    java.io.File(rootDir, "app/src/main/res"),
    java.io.File(rootDir, "app/src/debug/res"),
    java.io.File(rootDir, "wear/src/main/res")
)
for (resDir in resDirs) {
    if (resDir.exists()) {
        resDir.listFiles { f -> f.isDirectory && f.name.startsWith("values") }?.forEach { valuesDir ->
            val stringsFile = java.io.File(valuesDir, "strings.xml")
            if (stringsFile.exists()) {
                val content = stringsFile.readText()
                var newContent = content
                if (valuesDir.absolutePath.contains("/debug/")) {
                    newContent = content.replace(
                        Regex("""<string\s+name="app_name">PixelPlayer\s*\[D\]</string>"""),
                        """<string name="app_name">AKR - Pixelplayer [D]</string>"""
                    )
                } else {
                    newContent = content.replace(
                        Regex("""<string\s+name="app_name">PixelPlayer</string>"""),
                        """<string name="app_name">AKR - Pixelplayer</string>"""
                    )
                }
                if (newContent != content) {
                    stringsFile.writeText(newContent)
                }
            }
        }
    }
}





