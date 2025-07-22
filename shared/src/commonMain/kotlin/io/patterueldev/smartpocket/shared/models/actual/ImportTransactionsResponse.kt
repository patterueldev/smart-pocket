package io.patterueldev.smartpocket.shared.models.actual

import kotlinx.serialization.Serializable

@Serializable
data class ImportTransactionsResponse(
    val data: ImportTransactionsData,
)