package utils

func ToPtr[T any](v T) *T {
	return &v
}
func FromPtr[T any](v *T) T {
	if v == nil {
		var zero T
		return zero
	}
	return *v
}
