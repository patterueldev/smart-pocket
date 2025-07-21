package io.patterueldev.smartpocket.server

import io.patterueldev.smartpocket.shared.api.APIClient
import io.patterueldev.smartpocket.shared.api.ActualBudgetGenericResponse
import io.patterueldev.smartpocket.shared.api.ReceiptTransactionResponse
import io.patterueldev.smartpocket.shared.models.actual.ActualBatchTransactionsRequest
import io.patterueldev.smartpocket.shared.models.actual.ActualTransaction
import io.patterueldev.smartpocket.shared.models.actual.ActualTransactionRequest
import io.patterueldev.smartpocket.shared.models.actual.GetTransactionsResponse
import io.patterueldev.smartpocket.shared.models.ReceiptTransactionRequest
import kotlinx.datetime.LocalDateTime

class ReceiptTransactionUseCase(
    val apiClient: APIClient,
    val configuration: ServerConfiguration,
) {
    suspend operator fun invoke(request: ReceiptTransactionRequest): ReceiptTransactionResponse { // TODO: Change result
        try {
            // First, try to group the items by categories
            val groupedItems = request.items.groupBy { it.categoryId }
            // If there is only a single category, we can add one single transaction
            val categories = groupedItems.keys.toList()
            // if for whatever reason the categories are empty, we return a failure response
            if (categories.isEmpty()) {
                return ReceiptTransactionResponse(errorMessage = "No categories found in the request.")
            }

            val date: LocalDateTime = request.date
            // format to a string in the format "yyyy-MM-dd"
            val year = date.year.toString().padStart(4, '0')
            val month = date.monthNumber.toString().padStart(2, '0')
            val day = date.dayOfMonth.toString().padStart(2, '0')
            val formattedDate = "$year-$month-$day"

            if (categories.size == 1) {
                val response: ActualBudgetGenericResponse = apiClient.requestWithEndpoint(
                    endpoint = ActualBudgetEndpoint.AddTransaction(
                        budgetId = configuration.budgetSyncId,
                        accountId = request.accountId,
                        request = ActualTransactionRequest(
                            transaction = ActualTransaction(
                                account = request.accountId,
                                amount = request.amount,
                                payee = request.payeeId,
                                date = formattedDate,
                                category = categories.first(),
                                notes = "Consolidated items",
                            )
                        ),
                    )
                )
                return ReceiptTransactionResponse(
                    data = "Transaction added successfully", // should be the transaction ID or similar
                )
            } else {
                // First, create the parent transaction
                val parentTransactionResponse: ActualBudgetGenericResponse = apiClient.requestWithEndpoint(
                    endpoint = ActualBudgetEndpoint.AddTransaction(
                        budgetId = configuration.budgetSyncId,
                        accountId = request.accountId,
                        request = ActualTransactionRequest(
                            transaction = ActualTransaction(
                                account = request.accountId,
                                amount = request.amount,
                                payee = request.payeeId,
                                date = formattedDate,
                                category = null, // No category for the parent transaction
                                isParent = true,
                                notes = "Parent transaction for receipt",
                            )
                        ),
                    )
                )

                // Get the parent transaction ID
                val latestTransactions: GetTransactionsResponse = apiClient.requestWithEndpoint(
                    endpoint = ActualBudgetEndpoint.GetTransactions(
                        budgetId = configuration.budgetSyncId,
                        accountId = request.accountId,
                        sinceDate = formattedDate,
                        untilDate = formattedDate,
                    )
                )
                // Since the API doesn't return the transaction ID, we need to find it
                // Technically, the transactions between the sinceDate and untilDate could possibly contain at least one transaction with empty children
                // If by chance there are multiple transactions with empty children, we will not proceed with the request and throw an error
                // ideally the transactions with split category should have at least one child; if not, then there's a problem with budgetting

                val parentTransaction = latestTransactions.transactions.firstOrNull { it.isParent && it.subtransactions.isEmpty() }
                    ?: return ReceiptTransactionResponse(errorMessage = "Failed to create parent transaction.")

                val parentTransactionId = parentTransaction.id
                // Now, create the child transactions for each category
                val childTransactions = groupedItems.map { (categoryId, items) ->
                    ActualTransaction(
                        account = request.accountId,
                        amount = items.sumOf { it.price },
                        payee = request.payeeId,
                        date = formattedDate,
                        category = categoryId,
                        isChild = true,
                        parentId = parentTransactionId,
                        notes = "Child transaction for receipt",
                    )
                }

                val childrenTransactionResponse: ActualBudgetGenericResponse = apiClient.requestWithEndpoint(
                    endpoint = ActualBudgetEndpoint.AddBatchTransactions(
                        budgetId = configuration.budgetSyncId,
                        accountId = request.accountId,
                        request = ActualBatchTransactionsRequest(
                            transactions = childTransactions
                        ),
                    )
                )

                // For now we'll assume that it's a success if we reach this point
                return ReceiptTransactionResponse(
                    data = "Parent transaction ID: ${parentTransactionId}, Child transactions added successfully",
                )
            }
        } catch (e: Exception) {
            e.printStackTrace()
            return ReceiptTransactionResponse(errorMessage = "An error occurred while processing the receipt transaction: ${e.message ?: "Unknown error"}")
        }
    }
}