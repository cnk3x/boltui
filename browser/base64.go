package browser

import (
	"encoding/base64"
	"encoding/json"
)

type Base64 []byte

func (r *Base64) UnmarshalJSON(data []byte) error {
	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}

	b, err := base64.RawURLEncoding.DecodeString(s)
	if err != nil {
		return err
	}

	*r = b
	return nil
}

func (r Base64) MarshalJSON() ([]byte, error) {
	return json.Marshal(string(b64(r)))
}

func b64[S ~string | ~[]byte](src S) (out []byte) {
	if len(src) == 0 {
		return
	}
	enc := base64.RawURLEncoding
	buf := make([]byte, enc.EncodedLen(len(src)))
	enc.Encode(buf, []byte(src))
	return buf
}

var (
	_ json.Unmarshaler = (*Base64)(nil)
	_ json.Marshaler   = (Base64)(nil)
)
