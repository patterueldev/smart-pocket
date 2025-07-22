package io.patterueldev.smartpocket.shared

fun Double.toMinorUnit(): Long {
    return (this * 100).toLong()
}

fun Long.toMajorUnit(): Double {
    return this / 100.0
}

fun Double.amountMultipledBy(multiplier: Int): Double {
    val minorUnit = this.toMinorUnit()
    val multiplied = minorUnit * multiplier
    return multiplied.toMajorUnit()
}

fun List<Double>.amountSum(): Double {
    val amt = this.sumOf { it.toMinorUnit() }
    return amt.toMajorUnit()
}