package io.patterueldev.smartpocket.shared

fun Double.toMinorUnit(): Long {
    return (this * 100).toLong()
}

fun Double.negative(): Double {
    return -this
}

fun Long.toMajorUnit(): Double {
    return this / 100.0
}

fun Long.negative(): Long {
    return -this
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