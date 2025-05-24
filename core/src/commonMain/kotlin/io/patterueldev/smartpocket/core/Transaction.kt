package io.patterueldev.smartpocket.core

import kotlinx.datetime.Instant
import kotlinx.datetime.LocalDate
import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable

@Serializable
data class Transaction(
    val id: String,                  // UUID, generated client/server side
    val budgetId: String,            // budget context ID (e.g., "budget-for-2025")
    val accountId: String,           // owning account ID
    val categoryId: String,          // owning category ID

    val amount: Long,                // in minor units (e.g., 1000 = 10.00 PHP)

    @Contextual
    val postedAt: Instant, // full timestamp of when transaction occurred

    @Contextual
    val createdAt: Instant,          // record creation timestamp
    @Contextual
    val updatedAt: Instant,          // last update timestamp

    // Optional/flexible fields with defaults
    val originalCurrency: String? = null,        // nullable, only set if foreign transaction
    val amountOriginal: Long? = null,             // nullable original foreign amount
    val conversionRate: Double? = null,           // nullable FX rate used
    val conversionFeePercent: Double? = null,     // nullable conversion fee % (e.g., 1.85)
    val estimatedRateUsed: Boolean = false,       // false by default, true if FX rate was estimated

    val payee: String? = null,
    val note: String? = null,
    val cleared: Boolean = false,
    val isSplit: Boolean = false
)

@Serializable
data class Category(
    val id: String,                  // UUID, generated client/server side
    val budgetId: String,            // budget context ID (e.g., "budget-for-2025")
    val name: String,                // category name
    val icon: String? = null,        // optional icon name (e.g., "food")
    val color: String? = null,       // optional color code (e.g., "#FF5733")
    val createdAt: Instant,
    val updatedAt: Instant
)

@Serializable
data class Account(
    val id: String,                  // UUID, generated client/server side
    val budgetId: String,            // budget context ID (e.g., "budget-for-2025")
    val name: String,                // account name
    val type: String,                // account type (e.g., "checking", "savings")
    val balance: Long,               // current balance in minor units (e.g., 1000 = 10.00 PHP)
    val currency: String,            // currency code (e.g., "PHP")
    val createdAt: Instant,
    val updatedAt: Instant
)

@Serializable
enum class AccountType {
    CASH,
    SAVINGS,
    CREDIT_CARD,
}