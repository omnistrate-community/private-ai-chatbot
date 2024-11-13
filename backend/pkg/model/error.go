package model

type Error struct {
	Name      string `json:"name"`
	Id        string `json:"id"`
	Message   string `json:"message"`
	Temporary bool   `json:"temporary"`
	Timeout   bool   `json:"timeout"`
	Fault     bool   `json:"fault"`
}
