package io.patterueldev.smartpocket.core

import kotlinx.datetime.Instant
import kotlinx.datetime.LocalDate

data class Transaction(
    val id: String,
    val budgetId: String,             // For budget scoping
    val accountId: String,
    val categoryId: String,

    val amountOriginal: Long,         // In smallest unit of original currency (e.g., cents or yen)
    val originalCurrency: String,     // e.g., "JPY"
    val amountConverted: Long,        // In base currency (e.g., PHP cents)
    val conversionRate: Double?,      // Optional: JPY → PHP rate
    val conversionFeePercent: Double?,// Optional: e.g., 1.85
    val estimatedRateUsed: Boolean,   // Was the rate estimated?

    val date: LocalDate,
    val payee: String?,
    val note: String?,
    val cleared: Boolean = false,

    val isSplit: Boolean = false,     // If this transaction has split items
    val createdAt: Instant,
    val updatedAt: Instant
)