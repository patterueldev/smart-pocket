package io.patterueldev.smartpocket.ui.dashboard

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeContentPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material3.Card
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ProgressIndicatorDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.unit.dp
import org.jetbrains.compose.ui.tooling.preview.Preview

@Composable
fun DashboardView() {
    Screen {
        LazyColumn {
            // Assignment Status section
            val unassignedAmount = 12000
            if (unassignedAmount > 0) {
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(8.dp)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("Unassigned Money", style = MaterialTheme.typography.titleMedium)
                            Text("₱${"%,d".format(unassignedAmount)} not yet assigned")
                            TextButton(onClick = { /* TODO: Navigate to assign screen */ }) {
                                Text("Assign Now")
                            }
                        }
                    }
                }
            }

            item {
                // Weekly Spending Focus section
                Text("This Week", style = MaterialTheme.typography.displaySmall, modifier = Modifier.padding(start = 8.dp, top = 16.dp))
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Weekly Spending")
                        LinearProgressIndicator(progress = 0.6f, modifier = Modifier.fillMaxWidth())
                        Text("₱3,000 / ₱5,000 this week")
                    }
                }
            }
            // Recently spent categories with mock expandable transactions
            val recentCategories = listOf(
                Triple("Food", 500, 2500),
                Triple("Transport", 800, 2000),
                Triple("Entertainment", 1200, 1500)
            )
            val categoryTransactions = mapOf(
                "Food" to listOf("Lunch ₱150", "Groceries ₱300", "Coffee ₱50"),
                "Transport" to listOf("Taxi ₱200", "Bus ₱50", "Gas ₱550"),
                "Entertainment" to listOf("Movie ₱500", "Game ₱400", "Music ₱300")
            )
            item {
                Text("Recent Spending", style = MaterialTheme.typography.displaySmall, modifier = Modifier.padding(start = 8.dp, top = 16.dp))
            }

            recentCategories.forEach { (name, spent, budget) ->
                item {
                    var expanded by remember(name) { mutableStateOf(false) }

                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                            .clickable { expanded = !expanded }
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(name, style = MaterialTheme.typography.titleMedium)
                                Icon(
                                    imageVector = Icons.Filled.ArrowDropDown,
                                    contentDescription = null,
                                    modifier = Modifier.rotate(if (expanded) 180f else 0f)
                                )
                            }
                            LinearProgressIndicator(
                                progress = { spent.toFloat() / budget },
                                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                                color = ProgressIndicatorDefaults.linearColor,
                                trackColor = ProgressIndicatorDefaults.linearTrackColor,
                                strokeCap = ProgressIndicatorDefaults.LinearStrokeCap,
                            )
                            Text("₱${"%,d".format(spent)} / ₱${"%,d".format(budget)}", style = MaterialTheme.typography.bodyMedium)

                            if (expanded) {
                                Spacer(modifier = Modifier.padding(top = 8.dp))
                                categoryTransactions[name]?.take(3)?.forEach {
                                    Text("- $it", style = MaterialTheme.typography.bodySmall)
                                }
                                TextButton(onClick = { /* TODO: Add new transaction */ }) {
                                    Text("Add Transaction")
                                }
                            }
                        }
                    }
                }
            }

            item {
                // Upcoming dues section
                val upcomingDues = listOf("Credit Card - Due May 30", "Electricity - Due June 1", "Internet - Due June 2")
                if (upcomingDues.isNotEmpty()) {
                    Text("Upcoming Dues", style = MaterialTheme.typography.displaySmall, modifier = Modifier.padding(top = 16.dp, start = 8.dp))
                    Column {
                        upcomingDues.take(3).forEach { due ->
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text(due, modifier = Modifier.padding(16.dp))
                            }
                        }
                        TextButton(onClick = { /* TODO: Handle view all */ }) {
                            Text("View All")
                        }
                    }
                }
            }

            item {
                // Bank accounts section
                Text("Accounts", style = MaterialTheme.typography.displaySmall, modifier = Modifier.padding(top = 16.dp, start = 8.dp))
                val accounts = listOf(
                    "Cash" to 10000,
                    "Bank1" to 50000,
                    "Credit Card1" to -10000
                )
                val net = accounts.sumOf { it.second }
                accounts.forEach { (name, balance) ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(name)
                            Text("₱${"%,d".format(balance)}")
                        }
                    }
                }
                Text(
                    "Net Position: ₱${"%,d".format(net)}",
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(start = 16.dp, top = 8.dp)
                )
            }
        }
    }
}

private fun String.format(unassignedAmount: Int): String {
    return unassignedAmount.toString()
}

@Composable
@Preview
fun DashboardViewPreview() {
    DashboardView()
}


@Composable
fun Screen(
    content: @Composable () -> Unit,
) {
    Surface(color = MaterialTheme.colorScheme.background, modifier = Modifier.fillMaxSize().safeContentPadding()) {
        content()
    }
}