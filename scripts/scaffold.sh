#!/bin/bash

# Task 1.5 Folder Architecture
cd /home/uzair/Tasklync-customer-app/tasklync

# Create app structure
mkdir -p app/\(auth\) app/\(tabs\) app/\(map\) app/category app/worker/\[id\] app/service app/booking/\[id\] app/cart app/search app/notifications app/profile/addresses

# Create src structure
mkdir -p src/design src/components/ui/{Text,Button,Input,Badge,Avatar,Chip,Card,Rating,Skeleton,Switch,Checkbox,Divider,Tag,ProgressBar,Spinner} \
src/components/layout/{BottomSheet,Modal} src/components/feedback/{Toast,EmptyState,ErrorState,SuccessAnimation} \
src/components/{map,worker,booking,cart,service,chat,home,payment,notification,address,review} \
src/hooks src/store src/services/{api,socket,storage,notifications,maps} src/utils src/types src/config src/providers src/features

# Create assets structure
mkdir -p assets/{images,animations,icons/categories,icons/app,fonts}

# Create index.ts files for components
for dir in src/components/ui/* src/components/layout/* src/components/feedback/*; do
  if [ -d "$dir" ]; then
    touch "$dir/index.ts"
  fi
done

echo "Folder architecture scaffolded."
