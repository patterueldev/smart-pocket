package io.patterueldev.savealong

interface Platform {
    val name: String
}

expect fun getPlatform(): Platform