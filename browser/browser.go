package browser

import (
	"fmt"
	"log/slog"
	"net/http"
	"strings"

	"github.com/cnk3x/bolt"
	"github.com/cnk3x/ws"
)

func Bolt(boltPath string) *Browser {
	return &Browser{Provider: &boltProvider{bolt: bolt.Open(boltPath)}}
}

type Browser struct {
	Provider
	SelectRootDir string
}

type Provider interface {
	Meta() (any, error)
	CreateBucket(keyPath [][]byte) error
	List(keyPath [][]byte) (items []Entry, err error)
	Get(keyPath [][]byte) (data []byte, err error)
	Set(keyPath [][]byte, value []byte) error
	Del(keyPath [][]byte) error
	Close() error
}

type Entry struct {
	Key   Base64 `json:"key,omitempty"`
	Value Base64 `json:"value,omitempty"`
	Dir   bool   `json:"dir,omitempty"`
}

func (b *Browser) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if re := recover(); re != nil {
			var err error
			if e, ok := re.(error); ok {
				err = e
			} else {
				err = fmt.Errorf("%v", re)
			}
			slog.Warn("panic", "err", err)
			ws.Error(w, err, http.StatusInternalServerError)
		}
	}()

	var params struct {
		Action string   `json:"action,omitempty"`
		Key    []Base64 `json:"key,omitempty"`
		Value  Base64   `json:"value,omitempty"`
	}

	if err := ws.Decode(r, &params); err != nil {
		ws.Error(w, err, http.StatusBadRequest)
		return
	}

	out, err := b.Handle(params.Action, params.Key, params.Value)
	if err != nil {
		ws.Error(w, err, http.StatusInternalServerError)
		return
	}

	if out == nil {
		out = map[string]string{"msg": "OK"}
	}
	ws.Respond(w, out, 200)
}

func (b *Browser) Handle(action string, key []Base64, value Base64) (out any, err error) {
	keyPath := Map(key, func(p Base64) []byte { return p })

	switch action {
	case "meta":
		out, err = b.Meta()
	case "list":
		out, err = b.List(keyPath)
	case "get":
		var d Base64
		d, err = b.Get(keyPath)
		out = d
	case "set":
		err = b.Set(keyPath, []byte(value))
	case "del":
		err = b.Del(keyPath)
	case "new":
		err = b.CreateBucket(keyPath)
	default:
		err = fmt.Errorf("unknown action: %s", action)
	}

	slog.Debug("api", "action", action, "key", strings.Join(Map(key, func(p Base64) string { return string(p) }), "::"), "value", value, "err", err)
	return
}

func (b *Browser) SetProvider(provider Provider) {
	b.Provider = provider
}

func (b *Browser) Select(w http.ResponseWriter, r *http.Request) {
	dir := r.FormValue("dir")
	list, err := List(dir)
	if err != nil {
		ws.Error(w, err, http.StatusInternalServerError)
		return
	}
	ws.Respond(w, list, 200)
}

func Map[T any, R any](collection []T, iteratee func(item T) R) []R {
	result := make([]R, len(collection))

	for i := range collection {
		result[i] = iteratee(collection[i])
	}

	return result
}

func If[T any](condition bool, trueValue, falseValue T) T {
	if condition {
		return trueValue
	}
	return falseValue
}
