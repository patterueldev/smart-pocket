package io.patterueldev.smartpocket.server

import io.ktor.http.HttpMethod
import io.patterueldev.smartpocket.shared.api.generic.HttpRequestEndpoint
import io.patterueldev.smartpocket.shared.models.ActualBatchTransactionsRequest
import io.patterueldev.smartpocket.shared.models.ActualTransaction
import io.patterueldev.smartpocket.shared.models.ActualTransactionRequest
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
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
}

@Serializable
data class GetCategoriesResponse(
    val data: List<ActualCategory> = emptyList()
)

@Serializable
data class ActualCategory(
    val id: String,
    val name: String,
    @SerialName("is_income") val isIncome: Boolean,
    val hidden: Boolean,
    @SerialName("group_id") val groupId: String
)

@Serializable
data class GetPayeesResponse(
    val data: List<ActualPayee> = emptyList()
)

@Serializable
data class ActualPayee(
    val id: String,
    val name: String,
    @SerialName("transfer_acct") val transferAccount: String? = null
)

@Serializable
data class GetAccountsResponse(
    val data: List<ActualAccount> = emptyList()
)

@Serializable
data class ActualAccount(
    val id: String,
    val name: String,
    @SerialName("offbudget") val offBudget: Boolean,
    val closed: Boolean
)