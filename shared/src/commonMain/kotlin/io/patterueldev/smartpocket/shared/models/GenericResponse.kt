package io.patterueldev.smartpocket.shared.models

import kotlinx.serialization.Serializable

@Serializable
abstract class GenericResponse<T>(
    open val success: Boolean = false,
    open val message: String? = null,
) {
    abstract val data: T
}