package io.patterueldev.smartpocket.shared

object AmountHelper {
    fun toMinorUnit(amount: Double): Long {
        return (amount * 100).toLong()
    }

    fun sumAmountsToMinorUnit(amounts: List<Double>): Long {
        return amounts.sumOf { toMinorUnit(it) }
    }

//    fun productAmountsToMinorUnit(amounts: List<Double>): Long {
//        return amounts.fold(1L) { acc, amount -> acc * toMinorUnit(amount) }
//    }

    fun toMajorUnit(amount: Long): Double {
        return amount / 100.0
    }
}