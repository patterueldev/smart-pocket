package io.patterueldev.smartpocket.shared.extensions

fun String.toSnakeCase(): String {
    return this.lowercase()
        .replace("&", "and")
        .replace(" ", "_")
        .replace(Regex("[^a-z0-9_]"), "") // Remove non-alphanumeric characters except underscores
}