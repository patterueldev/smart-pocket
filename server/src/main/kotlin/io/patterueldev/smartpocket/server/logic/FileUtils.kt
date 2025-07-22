package io.patterueldev.smartpocket.server.logic

import java.io.File

object FileUtils {
    fun saveJson(baseDir: String, subDir: String, fileName: String, content: String) {
        val dir = File(baseDir, subDir)
        dir.mkdirs() // ✅ make sure directory exists

        val file = File(dir, fileName)

        file.writeText(content)
    }
}