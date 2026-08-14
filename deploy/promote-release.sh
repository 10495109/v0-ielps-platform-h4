#!/usr/bin/env bash
set -euo pipefail

if [[ "$EUID" -ne 0 ]]; then
  echo "root_required" >&2
  exit 1
fi

kind="${1:-}"
release="${2:-}"
case "$kind" in
  web|backend|learner) ;;
  *) echo "usage: promote-release.sh web|backend|learner /var/www/eilps/<release>" >&2; exit 2 ;;
esac

release="$(readlink -f "$release")"
case "$release" in
  /var/www/eilps/*-releases/*) ;;
  *) echo "release_outside_versioned_root" >&2; exit 3 ;;
esac

test -f "$release/release-manifest.sha256"
(cd "$release" && sha256sum -c release-manifest.sha256)
test "$(stat -c '%U:%G' "$release")" = "eilps:eilps"

find "$release" -type d -exec chmod 0550 {} +
find "$release" -type f -exec chmod 0440 {} +

pointer="/var/www/eilps/${kind}-current"
temporary="${pointer}.new.$$"
ln -s "$release" "$temporary"
mv -Tf "$temporary" "$pointer"

if [[ "$kind" = "backend" ]]; then
  systemctl restart eilps-api.service eilps-worker.service
  systemctl is-active --quiet eilps-api.service
  systemctl is-active --quiet eilps-worker.service
else
  systemctl restart "eilps-${kind}.service"
  systemctl is-active --quiet "eilps-${kind}.service"
fi
echo "promoted $kind to $release"
