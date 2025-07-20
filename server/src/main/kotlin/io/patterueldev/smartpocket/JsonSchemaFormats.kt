package io.patterueldev.smartpocket

import com.openai.core.JsonValue
import com.openai.models.ResponseFormatJsonSchema
import io.patterueldev.smartpocket.shared.models.SchemaType

fun ResponseFormatJsonSchema.Companion.from(type: SchemaType) = ResponseFormatJsonSchema.Companion.builder()
    .jsonSchema(
        ResponseFormatJsonSchema.JsonSchema.builder()
            .name(type.schemaName())
            .schema(JsonValue.Companion.from(type.schemaMap()))
            .strict(true)
            .build()
    )
    .build()