package io.patterueldev.smartpocket.shared.models

interface SchemaType {
    fun schemaName(): String
    fun schemaDescription(): String
    fun schemaMap(): Map<String, Any>
}