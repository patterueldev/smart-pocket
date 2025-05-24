package io.patterueldev.smartpocket.ui.dynamicform

sealed class FormField {
    data class TextField(
        val label: String,
        val value: String,
        val onValueChange: (String) -> Unit
    ) : FormField()

    data class NumberField(
        val label: String,
        val value: String,
        val onValueChange: (String) -> Unit
    ) : FormField()

    data class DropdownField(
        val label: String,
        val options: List<String>,
        val value: String,
        val onValueChange: (String) -> Unit
    ) : FormField()

    data class MultilineField(
        val label: String,
        val value: String,
        val onValueChange: (String) -> Unit
    ) : FormField()
}