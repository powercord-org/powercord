# Quick utility script to merge v2-dev to v2 and push
# aka me being too lazy to do it manually
git checkout v2
git merge v2-dev
git push origin v2
git checkout v2-dev
