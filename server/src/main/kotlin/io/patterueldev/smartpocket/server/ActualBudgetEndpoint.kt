package io.patterueldev.smartpocket.server

import io.ktor.http.HttpMethod
import io.patterueldev.smartpocket.shared.api.generic.HttpRequestEndpoint
import io.patterueldev.smartpocket.shared.models.actual.ActualBatchTransactionsRequest
import io.patterueldev.smartpocket.shared.models.actual.ActualImportTransactionsRequest
import io.patterueldev.smartpocket.shared.models.actual.ActualTransactionRequest
import kotlinx.serialization.json.Json

sealed class ActualBudgetEndpoint(
    override val path: String,
    override val method: HttpMethod?,
    override val urlQueryParameters: Map<String, String>? = null,
    override val jsonPayload: String? = null,
    override val requestTimeoutInMilliseconds: Long? = null,
): HttpRequestEndpoint() {
    override val requiresAuth: Boolean? = false

    data class GetTransactions(
        val budgetId: String,
        val accountId: String,
        val sinceDate: String,
        val untilDate: String? = null,
    ) : ActualBudgetEndpoint(
        path = "/v1/budgets/$budgetId/accounts/$accountId/transactions",
        method = HttpMethod.Companion.Get,
        urlQueryParameters = mapOf("since_date" to sinceDate) + untilDate.let {
            if (it != null) mapOf("until_date" to it) else emptyMap()
        }
    )

    data class AddTransaction(
        val budgetId: String,
        val accountId: String,
        val request: ActualTransactionRequest
    ) : ActualBudgetEndpoint(
        path = "/v1/budgets/$budgetId/accounts/$accountId/transactions",
        method = HttpMethod.Companion.Post,
        jsonPayload = Json.Default.encodeToString(request)
    )

    data class AddBatchTransactions(
        val budgetId: String,
        val accountId: String,
        val request: ActualBatchTransactionsRequest,
    ) : ActualBudgetEndpoint(
        path = "/v1/budgets/$budgetId/accounts/$accountId/transactions/batch",
        method = HttpMethod.Companion.Post,
        jsonPayload = Json.Default.encodeToString(request)
    )

    data class ImportTransactions(
        val budgetId: String,
        val accountId: String,
        val request: ActualImportTransactionsRequest,
    ) : ActualBudgetEndpoint(
        path = "/v1/budgets/$budgetId/accounts/$accountId/transactions/import",
        method = HttpMethod.Companion.Post,
        jsonPayload = Json.Default.encodeToString(request),
    )

    data class GetCategories(
        val budgetId: String,
    ) : ActualBudgetEndpoint(
        path = "/v1/budgets/$budgetId/categories",
        method = HttpMethod.Companion.Get
    )

    data class GetPayees(
        val budgetId: String,
    ) : ActualBudgetEndpoint(
        path = "/v1/budgets/$budgetId/payees",
        method = HttpMethod.Companion.Get
    )

    data class GetAccounts(
        val budgetId: String,
    ) : ActualBudgetEndpoint(
        path = "/v1/budgets/$budgetId/accounts",
        method = HttpMethod.Companion.Get
    )

    data class GetCategoryGroups(
        val budgetId: String,
    ) : ActualBudgetEndpoint(
        path = "/v1/budgets/$budgetId/categorygroups",
        method = HttpMethod.Companion.Get
    )
}
