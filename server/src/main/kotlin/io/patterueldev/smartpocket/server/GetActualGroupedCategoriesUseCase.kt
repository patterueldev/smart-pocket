package io.patterueldev.smartpocket.server

import io.patterueldev.smartpocket.shared.api.APIClient
import io.patterueldev.smartpocket.shared.models.actual.ActualCategoryGroup
import io.patterueldev.smartpocket.shared.models.actual.GetActualCategoryGroupsResponse
import io.patterueldev.smartpocket.shared.models.actual.GetCategoriesResponse

class GetActualGroupedCategoriesUseCase(
    private val apiClient: APIClient,
    private val serverConfiguration: ServerConfiguration,
) {
    suspend operator fun invoke(): List<ActualCategoryGroup> {
        // get category groups
        val categoryGroupsResponse: GetActualCategoryGroupsResponse = apiClient.requestWithEndpoint(
            endpoint = ActualBudgetEndpoint.GetCategoryGroups(
                budgetId = serverConfiguration.budgetSyncId,
            )
        )
        return categoryGroupsResponse.data
    }
}