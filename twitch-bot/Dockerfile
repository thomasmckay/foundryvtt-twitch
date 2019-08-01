FROM registry.redhat.io/rhel7:7.6
LABEL maintainer thomasmckay@redhat.com

ENV LC_ALL=en_US.UTF-8 \
    LANG=en_US.UTF-8

ENV R20TDIR /roll20-twitch
RUN mkdir /roll20-twitch
WORKDIR /roll20-twitch

RUN INSTALL_PKGS="\
        rh-nodejs8 \
        scl-utils \
        xorg-x11-server-Xvfb \
        gtk2 gtk3 \
        libXScrnSaver \
        alsa-lib \
        GConf2 \
        " && \
    yum install -y yum-utils && \
    yum-config-manager --quiet --disable "*" >/dev/null && \
    yum-config-manager --quiet --enable \
        rhel-7-server-rpms \
        rhel-server-rhscl-7-rpms \
        rhel-7-server-optional-rpms \
        --save >/dev/null && \
    yum -y --setopt=tsflags=nodocs --setopt=skip_missing_names_on_install=False install $INSTALL_PKGS && \
    yum -y update && \
    yum -y clean all

COPY LICENSE .
COPY package.json .
COPY package-lock.json .
COPY twitch.js .
COPY roll20.js .
COPY roll20-admin.js .
COPY roll20-ping.js .
COPY roll20-move.js .
COPY roll20-roll.js .
COPY roll20-say.js .
COPY entrypoint.sh .

RUN scl enable rh-nodejs8 "\
    npm install \
    "

# Cleanup
RUN UNINSTALL_PKGS="\
        kernel-headers \
        " && \
#     yum remove -y $UNINSTALL_PKGS && \
#     yum clean all && \
    rm -rf /var/cache/yum /tmp/* /var/tmp/* /root/.cache

RUN chgrp -R 0 $R20TDIR && \
    chmod -R g=u $R20TDIR

RUN chmod g=u /etc/passwd

VOLUME ["/quay-registry/config"]

ENTRYPOINT ["/roll20-twitch/entrypoint.sh"]
CMD ["start"]

#USER 1001
