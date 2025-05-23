package io.patterueldev.smartpocket

interface Platform {
    val name: String
}

expect fun getPlatform(): Platform