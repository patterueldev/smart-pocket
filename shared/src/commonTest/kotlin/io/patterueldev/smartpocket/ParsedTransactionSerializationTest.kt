package io.patterueldev.smartpocket

import io.patterueldev.smartpocket.shared.models.ParsedReceipt
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlinx.serialization.json.Json

class ParsedTransactionSerializationTest {
    @Test
    fun testParsedTransactionSerialization() {
        // given
        val json = rawJson

        // when
        val parsedReceipt = Json.decodeFromString<ParsedReceipt>(json)

        // then
//        assertEquals("2023-07-19'T'10:31:00'Z'", parsedTransaction.date.toString())
        assertEquals("mercury_drugstore", parsedReceipt.merchant)
    }

    private val rawJson = """
        {
            "date": "2023-07-19T10:31:00",
            "merchant": "mercury_drugstore",
            "paymentMethod": "bpi_cc",
            "items": [
                {
                    "name": "TSTE N GTEA280mL",
                    "price": 95000,
                    "quantity": 1,
                    "category": "general"
                },
                {
                    "name": "PF LCHMEAT 230g",
                    "price": 97000,
                    "quantity": 1,
                    "category": "food"
                },
                {
                    "name": "NESTLE LF MLKIL",
                    "price": 120000,
                    "quantity": 1,
                    "category": "general"
                },
                {
                    "name": "GARDE H-F WB400G",
                    "price": 70500,
                    "quantity": 1,
                    "category": "food"
                },
                {
                    "name": "NAGARAYA CNA 80G",
                    "price": 22750,
                    "quantity": 1,
                    "category": "food"
                },
                {
                    "name": "JJ PRH BBQ 85G",
                    "price": 35250,
                    "quantity": 1,
                    "category": "food"
                },
                {
                    "name": "QKR OATSW/MC500g",
                    "price": 139500,
                    "quantity": 1,
                    "category": "food"
                },
                {
                    "name": "NAGARAYA CH&S80G",
                    "price": 22750,
                    "quantity": 1,
                    "category": "food"
                },
                {
                    "name": "LUCKY M PCHOT60G",
                    "price": 12250,
                    "quantity": 1,
                    "category": "food"
                },
                {
                    "name": "LUCKY M PC CM60g",
                    "price": 12250,
                    "quantity": 1,
                    "category": "food"
                },
                {
                    "name": "JU PIAT SC 85g",
                    "price": 76500,
                    "quantity": 1,
                    "category": "food"
                },
                {
                    "name": "NONGSHM R GS131g",
                    "price": 45500,
                    "quantity": 1,
                    "category": "food"
                },
                {
                    "name": "KATINKO LIN 10mL",
                    "price": 0,
                    "quantity": 1,
                    "category": "general"
                }
            ]
        }
    """.trimIndent()
}