package io.patterueldev.smartpocket.shared.models.actual

import kotlinx.serialization.Serializable

@Serializable
data class ImportTransactionsData(
    val errors: List<String> = emptyList(),
    val added: List<String> = emptyList(),
    val updated: List<String> = emptyList(),
    val updatedPreview: List<String> = emptyList(),
)